import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface ListingRow {
    id: string;
    title: string | null;
    description: string | null;
    category: string | null;
    subcategory: string | null;
    tags: string[] | null;
    province_id: number | string | null;
}

const normalize = (text: string): string => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// Domain-specific keywords to canonical tags mapping
const CATEGORY_RULES: Record<string, [RegExp, string][]> = {
    bovino: [
        [/\b(terneros?|terneras?|bezerros?|bezerras?|añojos?|chotos?|becerros?)\b/i, "terneros"],
        [/\b(vacas?|novillas?|novillos?|vaca)\b/i, "vacas"],
        [/\b(lecheras?|leche|ordeño)\b/i, "vacas lecheras"],
        [/\b(toros?|touros?|semental(es)?)\b/i, "sementales"],
        [/\b(limusin|limusina|limousine)\b/i, "limusín"],
        [/\b(charoles|charolais)\b/i, "charolais"],
        [/\b(angus|black angus)\b/i, "angus"],
        [/\b(frisona|holstein)\b/i, "frisona"],
        [/\b(rubia gallega)\b/i, "rubia gallega"],
        [/\b(asturiana)\b/i, "asturiana de los valles"],
        [/\b(retinta)\b/i, "retinta"],
        [/\b(avileña|avilena)\b/i, "avileña negra ibérica"],
        [/\b(carne|cebo)\b/i, "vacas de carne"]
    ],
    equino: [
        [/\b(potros?|potras?|potrillos?|poldros?|poldras?)\b/i, "potros"],
        [/\b(yeguas?|eguas?)\b/i, "yeguas"],
        [/\b(caballos?|cavalos?)\b/i, "caballos"],
        [/\b(burros?|burras?|asnos?|asnas?)\b/i, "burros"],
        [/\b(mulas?|mulos?)\b/i, "mulas"],
        [/\b(lusitan[oa]s?)\b/i, "lusitano"],
        [/\b(pre|pura raza espanola)\b/i, "pura raza española"],
        [/\b(arabe|pura sangre arabe|psi)\b/i, "pura sangre árabe"],
        [/\b(frison|frisones)\b/i, "frisón"],
        [/\b(appaloosa|apaloosa)\b/i, "appaloosa"],
        [/\b(doma|salto|paseo|tiro|enganche)\b/i, "caballos de paseo"],
        [/\b(semental(es)?)\b/i, "sementales equinos"]
    ],
    caprino: [
        [/\b(cabritos?|cabritas?|chivitos?|chivitas?|chivos?|chivas?)\b/i, "cabritos"],
        [/\b(cabras?)\b/i, "cabras"],
        [/\b(bodes?|machos? cabrios?)\b/i, "machos cabríos"],
        [/\b(enanas?|anoes|anoas)\b/i, "cabra enana"],
        [/\b(murciano|granadina|murciana)\b/i, "murciano-granadina"],
        [/\b(florida)\b/i, "florida"],
        [/\b(malagueña|malaguena)\b/i, "malagueña"],
        [/\b(saanen|alpina)\b/i, "saanen"],
        [/\b(leche|lecheras?|ordeño)\b/i, "cabras lecheras"]
    ],
    ovino: [
        [/\b(corderos?|corderas?|lechazos?|borregos?|borregas?|ternasco)\b/i, "corderos"],
        [/\b(ovejas?|ovelhas?)\b/i, "ovejas"],
        [/\b(carneros?|carneiros?|moruecos?)\b/i, "carneros"],
        [/\b(merin[ao]s?)\b/i, "merina"],
        [/\b(mancheg[ao]s?)\b/i, "manchega"],
        [/\b(assaf)\b/i, "assaf"],
        [/\b(lacaune)\b/i, "lacaune"],
        [/\b(churr[ao]s?)\b/i, "churra"],
        [/\b(lecheras?|leche|ordeño)\b/i, "ovejas lecheras"]
    ],
    porcino: [
        [/\b(lechones?|leitoes?|cochinillos?|marranos?|gorrinos?)\b/i, "lechones"],
        [/\b(iberic[oa]s?|bellota)\b/i, "cerdos ibéricos"],
        [/\b(duroc)\b/i, "duroc"],
        [/\b(pietrain|landrace|large white)\b/i, "cerdo blanco"],
        [/\b(verracos?|semental(es)?)\b/i, "verraco"],
        [/\b(cerdas?|porcas?)\b/i, "cerda madre"],
        [/\b(cerdos?|porcos?|cochos?|guarros?)\b/i, "cerdos"]
    ],
    avicultura: [
        [/\b(perdiz|perdices)\b/i, "perdices"],
        [/\b(pollos?|frangos?|pollitos?|pitos?)\b/i, "pollos"],
        [/\b(gallinas?|galinhas?|ponedoras?)\b/i, "gallinas"],
        [/\b(gallos?|galos?|kikos?)\b/i, "gallos"],
        [/\b(patos?|anades?)\b/i, "patos"],
        [/\b(pavos?|perus?)\b/i, "pavos"],
        [/\b(codorniz|codornices)\b/i, "codornices"],
        [/\b(faisan|faisanes)\b/i, "faisanes"],
        [/\b(palomas?|pombos?)\b/i, "palomas"],
        [/\b(ocas?|gansos?)\b/i, "gansos"],
        [/\b(huevos?)\b/i, "huevos fértiles"]
    ],
    conejos: [
        [/\b(conejos?|coelhos?|gazapos?)\b/i, "conejos"]
    ],
    apicultura: [
        [/\b(abejas?|abelhas?|reinas?)\b/i, "abejas"],
        [/\b(colmenas?|corticos?|enjambres?)\b/i, "colmenas"]
    ],
    maquinaria: [
        [/\b(tractores?|trator(es)?)\b/i, "tractores"],
        [/\b(remolques?|reboques?)\b/i, "remolques"],
        [/\b(cosechadoras?)\b/i, "cosechadoras"],
        [/\b(empacadoras?)\b/i, "empacadoras"],
        [/\b(desbrozadoras?|rocadoras?)\b/i, "desbrozadoras"],
        [/\b(segadoras?)\b/i, "segadoras"],
        [/\b(sembradoras?)\b/i, "sembradoras"],
        [/\b(motocultor(es)?)\b/i, "motocultores"],
        [/\b(sulfatadoras?|pulverizadores?)\b/i, "sulfatadoras"],
        [/\b(trituradoras?)\b/i, "trituradoras"]
    ],
    forraje: [
        [/\b(alfalfa)\b/i, "alfalfa"],
        [/\b(heno|paja|silado|veza|festuca|raigras|forraje)\b/i, "forraje"]
    ]
};

export function determineListingTags(listing: ListingRow): string[] {
    const titleNorm = normalize(listing.title || "");
    const descNorm = normalize(listing.description || "");
    const content = `${titleNorm} ${descNorm}`;

    const cat = (listing.category || "").toLowerCase().trim();
    const subcat = (listing.subcategory || "").toLowerCase().trim();

    // Determine target domain
    let domain = "";
    if (subcat.includes("bovin") || cat.includes("bovin")) domain = "bovino";
    else if (subcat.includes("equin") || cat.includes("equin") || cat.includes("equitaci") || subcat.includes("equitaci")) domain = "equino";
    else if (subcat.includes("caprin") || cat.includes("caprin")) domain = "caprino";
    else if (subcat.includes("ovin") || cat.includes("ovin")) domain = "ovino";
    else if (subcat.includes("porcin") || cat.includes("porcin")) domain = "porcino";
    else if (subcat.includes("avicult") || cat.includes("avicult")) domain = "avicultura";
    else if (subcat.includes("conej") || cat.includes("conej")) domain = "conejos";
    else if (subcat.includes("apicult") || cat.includes("apicult")) domain = "apicultura";
    else if (cat.includes("maquin") || subcat.includes("maquin") || cat.includes("tractor")) domain = "maquinaria";
    else if (cat.includes("forraj") || subcat.includes("forraj")) domain = "forraje";

    const matchedTags: string[] = [];

    // 1. If domain identified, check domain rules
    if (domain && CATEGORY_RULES[domain]) {
        for (const [regex, tag] of CATEGORY_RULES[domain]) {
            if (regex.test(content) && !matchedTags.includes(tag)) {
                matchedTags.push(tag);
                if (matchedTags.length >= 2) break;
            }
        }
    }

    // 2. Canonical complementary fallbacks by domain
    if (domain === "bovino") {
        if (!matchedTags.includes("vacas") && matchedTags.length < 2) matchedTags.push("vacas");
        if (!matchedTags.includes("terneros") && matchedTags.length < 2) matchedTags.push("terneros");
    } else if (domain === "equino") {
        if (!matchedTags.includes("caballos") && matchedTags.length < 2) matchedTags.push("caballos");
        if (!matchedTags.includes("yeguas") && matchedTags.length < 2) matchedTags.push("yeguas");
    } else if (domain === "caprino") {
        if (!matchedTags.includes("cabras") && matchedTags.length < 2) matchedTags.push("cabras");
        if (!matchedTags.includes("chivos") && matchedTags.length < 2) matchedTags.push("chivos");
    } else if (domain === "ovino") {
        if (!matchedTags.includes("ovejas") && matchedTags.length < 2) matchedTags.push("ovejas");
        if (!matchedTags.includes("corderos") && matchedTags.length < 2) matchedTags.push("corderos");
    } else if (domain === "porcino") {
        if (!matchedTags.includes("cerdos") && matchedTags.length < 2) matchedTags.push("cerdos");
        if (!matchedTags.includes("lechones") && matchedTags.length < 2) matchedTags.push("lechones");
    } else if (domain === "avicultura") {
        if (!matchedTags.includes("gallinas") && matchedTags.length < 2) matchedTags.push("gallinas");
        if (!matchedTags.includes("pollos") && matchedTags.length < 2) matchedTags.push("pollos");
    } else if (domain === "conejos") {
        if (!matchedTags.includes("conejos") && matchedTags.length < 2) matchedTags.push("conejos");
        if (!matchedTags.includes("cría de conejos") && matchedTags.length < 2) matchedTags.push("cría de conejos");
    } else if (domain === "apicultura") {
        if (!matchedTags.includes("colmenas") && matchedTags.length < 2) matchedTags.push("colmenas");
        if (!matchedTags.includes("abejas") && matchedTags.length < 2) matchedTags.push("abejas");
    } else if (domain === "maquinaria") {
        if (subcat.includes("tractor") || /\btractor(es)?\b/i.test(content)) {
            if (!matchedTags.includes("tractores")) matchedTags.push("tractores");
        }
        if (subcat.includes("remolque") || /\bremolque(s)?\b/i.test(content)) {
            if (!matchedTags.includes("remolques")) matchedTags.push("remolques");
        }
        if (!matchedTags.includes("maquinaria agrícola") && matchedTags.length < 2) matchedTags.push("maquinaria agrícola");
        if (!matchedTags.includes("aperos agrícolas") && matchedTags.length < 2) matchedTags.push("aperos agrícolas");
    } else if (domain === "forraje") {
        if (!matchedTags.includes("forraje") && matchedTags.length < 2) matchedTags.push("forraje");
        if (!matchedTags.includes("alfalfa") && matchedTags.length < 2) matchedTags.push("alfalfa");
    } else if (cat.includes("equipamiento") || cat.includes("material")) {
        if (subcat.includes("equitaci") || /\b(silla de montar|montura|caballo|jinete|hipica)\b/i.test(content)) {
            matchedTags.push("material hípico", "equitación");
        } else if (subcat.includes("avicult") || /\b(gallina|pollo|ave|incubadora)\b/i.test(content)) {
            matchedTags.push("material avícola", "avicultura");
        } else {
            matchedTags.push("equipamiento ganadero", "material rural");
        }
    } else if (cat.includes("fincas")) {
        matchedTags.push("fincas rústicas", "terreno rural");
    } else if (cat.includes("servicios")) {
        matchedTags.push("servicios rurales", "mantenimiento de fincas");
    } else if (cat.includes("alimentos")) {
        matchedTags.push("alimentos km0", "productos locales");
    } else if (cat.includes("camiones") || cat.includes("coches") || cat.includes("motos") || cat.includes("atv")) {
        matchedTags.push("vehículos agrícolas", "todoterreno");
    } else if (cat.includes("recambios")) {
        matchedTags.push("recambios maquinaria", "repuestos agrícolas");
    } else {
        matchedTags.push("mercado rural", "anuncios rurales");
    }

    return matchedTags.slice(0, 2);
}

async function runBackfill() {
    console.log("Fetching all active Ruralpop listings...");

    let allListings: ListingRow[] = [];
    let page = 0;
    const PAGE_SIZE = 1000;

    while (true) {
        const { data, error } = await supabase
            .from("listings")
            .select("id, title, description, category, subcategory, tags, province_id")
            .eq("status", "active")
            .or("tenant_id.eq.ea2490cc-dc33-48f3-bc7b-82b14aa70eb9,tenant_id.is.null")
            .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (error) {
            console.error("Error fetching listings:", error);
            process.exit(1);
        }

        if (!data || data.length === 0) break;
        allListings = [...allListings, ...(data as ListingRow[])];
        if (data.length < PAGE_SIZE) break;
        page++;
    }

    console.log(`Total active Ruralpop listings: ${allListings.length}`);

    const listingsToUpdate = allListings.filter(
        (l) => !l.tags || !Array.isArray(l.tags) || l.tags.length === 0
    );

    console.log(`Found ${listingsToUpdate.length} listings needing tags.`);

    if (listingsToUpdate.length === 0) {
        console.log("All listings already have tags. Nothing to backfill.");
        return;
    }

    const BATCH_SIZE = 50;
    let updatedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < listingsToUpdate.length; i += BATCH_SIZE) {
        const batch = listingsToUpdate.slice(i, i + BATCH_SIZE);

        await Promise.all(
            batch.map(async (listing) => {
                const assigned = determineListingTags(listing);
                const { error: updateError } = await supabase
                    .from("listings")
                    .update({ tags: assigned })
                    .eq("id", listing.id);

                if (updateError) {
                    console.error(`Failed to update listing ${listing.id}:`, updateError.message);
                    failedCount++;
                } else {
                    updatedCount++;
                }
            })
        );

        const progress = Math.min(i + BATCH_SIZE, listingsToUpdate.length);
        process.stdout.write(`\rProgress: ${progress} / ${listingsToUpdate.length} listings updated...`);
    }

    console.log(`\n\n=== BACKFILL COMPLETE ===`);
    console.log(`Successfully updated: ${updatedCount} listings`);
    if (failedCount > 0) {
        console.warn(`Failed updates: ${failedCount} listings`);
    }
}

runBackfill();
