const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const RURALPOP_TENANT_ID = "ea2490cc-dc33-48f3-bc7b-82b14aa70eb9";

const normalize = (s) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const KEYWORD_RULES = [
    { patterns: [/\bpastor\s+alem[aá]n\b/i], tag: "pastor alemán" },
    { patterns: [/\bborder\s+collie\b/i], tag: "border collie" },
    { patterns: [/\bmast[ií]n(\s+espa[ñn]ol|\s+leon[eé]s|\s+del\s+pirineo)?\b/i], tag: "mastín español" },
    { patterns: [/\bpodenco\b/i], tag: "podenco" },
    { patterns: [/\bgalgo(\s+espa[ñn]ol)?\b/i], tag: "galgo español" },
    { patterns: [/\bsetter(\s+ingl[eé]s)?\b/i], tag: "setter inglés" },
    { patterns: [/\b(spaniel\s+)?bret[oó]n\b/i], tag: "spaniel bretón" },
    { patterns: [/\bbraco(\s+italiano|\s+alem[aá]n)?\b/i], tag: "bracco italiano" },
    { patterns: [/\bpointer\b/i], tag: "pointer" },
    { patterns: [/\bteckel\b/i], tag: "teckel" },
    { patterns: [/\bbodeguero(\s+andaluz)?\b/i], tag: "ratonero bodeguero andaluz" },
    { patterns: [/\b(schnauzer|snauzer)\b/i], tag: "schnauzer" },
    { patterns: [/\bchihuahua\b/i], tag: "chihuahua" },
    { patterns: [/\bcaniche\b/i], tag: "caniche" },
    { patterns: [/\bcocker(\s+spaniel)?\b/i], tag: "cocker spaniel" },
    { patterns: [/\bcachorros?\b/i], tag: "cachorros" },
    { patterns: [/\bcamadas?\b/i], tag: "camada" },
    { patterns: [/\b(palomas?\s+mensajeras?|mensajeras?)\b/i], tag: "palomas mensajeras" },
    { patterns: [/\bpalomas?\b|\bpich[oó]n(es)?\b/i], tag: "palomas" },
    { patterns: [/\bcanarios?\b/i], tag: "canarios" },
    { patterns: [/\b(periquitos?|pirikitos?)\b/i], tag: "periquitos" },
    { patterns: [/\bagapornis?\b/i], tag: "agapornis" },
    { patterns: [/\b(loros?|cotorras?)\b/i], tag: "loros" },
    { patterns: [/\bgallos?\b/i], tag: "gallos" },
    { patterns: [/\bgallinas?\s+ponedoras?\b/i], tag: "gallinas ponedoras" },
    { patterns: [/\bgallinas?\s+camperas?\b/i], tag: "gallinas camperas" },
    { patterns: [/\bgallinas?\b/i], tag: "gallinas" },
    { patterns: [/\b(pollitos?|pollos?)\b/i], tag: "pollos" },
    { patterns: [/\bpatos?\b/i], tag: "patos" },
    { patterns: [/\bpavos?\b/i], tag: "pavos" },
    { patterns: [/\b(ocas?|gansos?)\b/i], tag: "ocas" },
    { patterns: [/\b(codorniz|codornices)\b/i], tag: "codornices" },
    { patterns: [/\bfais[aá]n(es)?\b/i], tag: "faisanes" },
    { patterns: [/\bperdiz|perdices\b/i], tag: "perdices" },
    { patterns: [/\b(araucana|auracana|auracano)\b/i], tag: "araucana" },
    { patterns: [/\bsedosa(\s+del\s+jap[oó]n)?\b/i], tag: "sedosa del japón" },
    { patterns: [/\bayam\s+cemani\b/i], tag: "ayam cemani" },
    { patterns: [/\bmarans\b/i], tag: "marans" },
    { patterns: [/\bbrahma\b/i], tag: "brahma" },
    { patterns: [/\b(frisona|frison|holstein)\b/i], tag: "frisona" },
    { patterns: [/\blimus[ií]n(e)?\b/i], tag: "limusín" },
    { patterns: [/\b(charol[eé]s|charolais)\b/i], tag: "charolais" },
    { patterns: [/\brubia\s+gallega\b/i], tag: "rubia gallega" },
    { patterns: [/\basturiana(\s+de\s+los\s+valles)?\b/i], tag: "asturiana de los valles" },
    { patterns: [/\bretinta\b/i], tag: "retinta" },
    { patterns: [/\bangus\b/i], tag: "angus" },
    { patterns: [/\bwagyu\b/i], tag: "wagyu" },
    { patterns: [/\bterner[oa]s?\b/i], tag: "terneros" },
    { patterns: [/\bnovill[oa]s?\b/i], tag: "novillas" },
    { patterns: [/\bbecerr[oa]s?\b/i], tag: "becerros" },
    { patterns: [/\bchotos?\b/i], tag: "chotos" },
    { patterns: [/\bvacas?\b/i], tag: "vacas" },
    { patterns: [/\btoros?\b/i], tag: "toro semental" },
    { patterns: [/\bcaballos?\b/i], tag: "caballos" },
    { patterns: [/\byeguas?\b/i], tag: "yeguas" },
    { patterns: [/\bpotr[oa]s?\b/i], tag: "potros" },
    { patterns: [/\b(burr[oa]s?|asnos?|burrin)\b/i], tag: "burros" },
    { patterns: [/\bmul[oa]s?\b/i], tag: "mulas" },
    { patterns: [/\b(ponis?|ponys?)\b/i], tag: "ponis" },
    { patterns: [/\blusitano\b/i], tag: "lusitano" },
    { patterns: [/\bpura\s+raza\s+espa[ñn]ola|\bpre\b/i], tag: "pura raza española" },
    { patterns: [/\bhispano.?árabe|hispano.?arabe/i], tag: "hispano-árabe" },
    { patterns: [/\bcabras?\b/i], tag: "cabras" },
    { patterns: [/\bchiv[oa]s?\b/i], tag: "chivos" },
    { patterns: [/\bcabrit[oa]s?\b/i], tag: "cabritos" },
    { patterns: [/\bboer\b/i], tag: "boer" },
    { patterns: [/\bmurciano.?granadina/i], tag: "murciano-granadina" },
    { patterns: [/\bcabra\s+enana\b/i], tag: "cabra enana" },
    { patterns: [/\bovejas?\b/i], tag: "ovejas" },
    { patterns: [/\bcorder[oa]s?\b/i], tag: "corderos" },
    { patterns: [/\bcarneros?\b/i], tag: "carneros" },
    { patterns: [/\bborreg[oa]s?\b/i], tag: "borregos" },
    { patterns: [/\blechazo\b/i], tag: "lechazo" },
    { patterns: [/\bmerina\b/i], tag: "merina" },
    { patterns: [/\bassaf\b/i], tag: "assaf" },
    { patterns: [/\bcerdos?\b/i], tag: "cerdos" },
    { patterns: [/\blech[oó]n(es)?\b/i], tag: "lechones" },
    { patterns: [/\bcochinillos?\b/i], tag: "cochinillos" },
    { patterns: [/\bib[eé]rico\b/i], tag: "cerdos ibéricos" },
    { patterns: [/\bduroc\b/i], tag: "duroc" },
    { patterns: [/\bmangalica\b/i], tag: "mangalica" },
    { patterns: [/\bcolmenas?\b/i], tag: "colmenas" },
    { patterns: [/\benjambres?\b/i], tag: "enjambres" },
    { patterns: [/\babejas?\b/i], tag: "abejas" },
    { patterns: [/\bmiel\b/i], tag: "miel" },
    { patterns: [/\bconejos?\b/i], tag: "conejos" },
    { patterns: [/\bgazapos?\b/i], tag: "gazapos" },
    { patterns: [/\bbelier\b/i], tag: "belier" },
    { patterns: [/\bjohn\s+deere\b/i], tag: "john deere" },
    { patterns: [/\bnew\s+holland\b/i], tag: "new holland" },
    { patterns: [/\bkubota\b/i], tag: "kubota" },
    { patterns: [/\bmassey\s+ferguson\b/i], tag: "massey ferguson" },
    { patterns: [/\bfendt\b/i], tag: "fendt" },
    { patterns: [/\bcase\s+ih\b/i], tag: "case ih" },
    { patterns: [/\bdeutz(-fahr)?\b/i], tag: "deutz-fahr" },
    { patterns: [/\blandini\b/i], tag: "landini" },
    { patterns: [/\bsame\b/i], tag: "same" },
    { patterns: [/\bpasquali\b/i], tag: "pasquali" },
    { patterns: [/\bagria\b/i], tag: "agria" },
    { patterns: [/\bebro\b/i], tag: "ebro" },
    { patterns: [/\bmini.?tractor\b/i], tag: "mini tractor" },
    { patterns: [/\btractor(es)?\b|\btrator(es)?\b/i], tag: "tractores" },
    { patterns: [/\bremolques?\b|\breboque[s]?\b/i], tag: "remolques" },
    { patterns: [/\b(fresa|rotovator|rotavator|frese)\b/i], tag: "rotavator" },
    { patterns: [/\barados?\b/i], tag: "arados" },
    { patterns: [/\bgradas?\b/i], tag: "gradas" },
    { patterns: [/\bdesbrozadoras?\b/i], tag: "desbrozadoras" },
    { patterns: [/\bsegadoras?\b/i], tag: "segadoras" },
    { patterns: [/\bempacadoras?\b/i], tag: "empacadoras" },
    { patterns: [/\bmotocultor(es)?\b/i], tag: "motocultores" },
    { patterns: [/\b(monturas?|sillas?\s+de\s+montar)\b/i], tag: "sillas de montar" },
    { patterns: [/\b(bocados?|filetes?)\b/i], tag: "bocados y filetes" },
    { patterns: [/\bcabezadas?\b/i], tag: "cabezadas" },
    { patterns: [/\balfalfa\b/i], tag: "alfalfa" },
    { patterns: [/\bpaja\b/i], tag: "paja" },
    { patterns: [/\bheno\b/i], tag: "heno" }
];

const DEFAULT_TAGS_MAP = {
    "perros": ["perros", "perro pastor"],
    "avicultura": ["avicultura", "gallinas"],
    "tractores": ["tractores", "maquinaria agricola"],
    "caprino": ["cabras", "caprino"],
    "equino": ["caballos", "equino"],
    "bovino": ["vacas", "ganado vacuno"],
    "ovino": ["ovejas", "ovino"],
    "porcino": ["cerdos", "porcino"],
    "apicultura": ["abejas", "apicultura"],
    "conejos": ["conejos", "cunicultura"],
    "depositos": ["depositos", "maquinaria agricola"],
    "depósitos": ["depositos", "maquinaria agricola"],
    "remolques": ["remolques", "maquinaria agricola"],
    "motocultores": ["motocultores", "maquinaria agricola"],
    "otra maquinaria agricola": ["maquinaria agricola", "herramientas agricolas"],
    "otra maquinaria agrícola": ["maquinaria agricola", "herramientas agricolas"],
    "otra maquinaria": ["maquinaria agricola", "herramientas"],
    "empacadoras": ["empacadoras", "maquinaria agricola"],
    "desbrozadoras": ["desbrozadoras", "maquinaria agricola"],
    "segadoras": ["segadoras", "maquinaria agricola"],
    "volteadoras": ["volteadoras", "maquinaria agricola"],
    "trituradoras": ["trituradoras", "maquinaria agricola"],
    "abonadoras": ["abonadoras", "maquinaria agricola"],
    "sembradoras": ["sembradoras", "maquinaria agricola"],
    "cosechadoras": ["cosechadoras", "maquinaria agricola"],
    "material avicultura": ["material avicultura", "jaulas"],
    "material conejos": ["material conejos", "jaulas conejos"],
    "material vacuno": ["material vacuno", "equipamiento ganadero"],
    "material ovino": ["material ovino", "equipamiento ganadero"],
    "material porcino": ["material porcino", "equipamiento ganadero"],
    "material apicultura": ["material apicultura", "colmenas"],
    "ordeño y leche": ["ordeño", "sala de ordeño"],
    "cerramientos": ["cerramientos", "vallas"],
    "cerramientos y vallados": ["cerramientos", "vallas"],
    "limpieza, purines y estiercol": ["limpieza purines", "maquinaria agricola"],
    "limpieza, purines y estiércol": ["limpieza purines", "maquinaria agricola"],
    "alimentacion y agua": ["comederos", "bebederos"],
    "alimentación y agua": ["comederos", "bebederos"],
    "equitacion y material equino": ["material ecuestre", "equitacion"],
    "equitación y material equino": ["material ecuestre", "equitacion"],
    "veterinarios": ["veterinarios", "servicios veterinarios"],
    "herradores": ["herradores", "cuidado cascos"],
    "esquiladores": ["esquiladores", "esquila ovejas"],
    "transporte": ["transporte ganado", "transporte"],
    "construccion rural": ["construccion rural", "naves agricolas"],
    "construcción rural": ["construccion rural", "naves agricolas"],
    "servicios forestales": ["servicios forestales", "limpieza fincas"],
    "mantenimiento de fincas": ["mantenimiento fincas", "desbroce"],
    "venta": ["venta fincas", "fincas rusticas"],
    "alquiler": ["alquiler fincas", "fincas rusticas"],
    "traspasos explotaciones": ["traspaso explotacion", "ganaderia"],
    "plantas y plantones": ["plantones", "agricultura"],
    "semillas": ["semillas", "agricultura"],
    "otros": ["animales de granja", "rural"]
};

const CATEGORY_DEFAULT_TAGS = {
    "ganaderia": ["ganaderia", "ganado"],
    "maquinaria": ["maquinaria agricola", "herramientas agricolas"],
    "recambios-maquinaria": ["recambios maquinaria", "repuestos agricolas"],
    "equipamiento-y-material": ["equipamiento ganadero", "material agricola"],
    "forraje": ["forraje", "alimentacion animal"],
    "fincas": ["fincas rusticas", "parcelas"],
    "agricultura": ["agricultura", "cultivos"],
    "servicios": ["servicios rurales", "servicios agricolas"],
    "alimentos": ["alimentos km0", "productos artesanos"],
    "coches": ["vehiculos campo", "4x4"],
    "camiones-y-furgonetas": ["furgonetas", "transporte"],
    "motos": ["quads", "motos campo"]
};

function ensureMinimumTags(params) {
    const minTags = params.minTags ?? 2;
    const existing = params.existingTags || [];

    const internalTags = existing.filter((t) => typeof t === "string" && t.startsWith("_"));
    const validExisting = existing
        .filter((t) => typeof t === "string" && !t.startsWith("_") && t.trim().length > 0)
        .map(t => t.trim().toLowerCase());

    const tagsSet = new Set(validExisting);

    if (tagsSet.size >= minTags) {
        return [...Array.from(tagsSet), ...internalTags];
    }

    const textToSearch = `${params.title || ""} ${params.description || ""}`.toLowerCase();

    // 1. Keyword rules
    for (const rule of KEYWORD_RULES) {
        for (const pattern of rule.patterns) {
            if (pattern.test(textToSearch)) {
                tagsSet.add(rule.tag.toLowerCase());
                break;
            }
        }
        if (tagsSet.size >= 5) break;
    }

    // 2. Subcategory matching
    const subcatNorm = normalize(params.subcategory);
    if (DEFAULT_TAGS_MAP[subcatNorm]) {
        for (const tag of DEFAULT_TAGS_MAP[subcatNorm]) {
            tagsSet.add(tag);
            if (tagsSet.size >= 3) break;
        }
    }

    // 3. Category matching
    const catNorm = normalize(params.category);
    if (tagsSet.size < minTags && CATEGORY_DEFAULT_TAGS[catNorm]) {
        for (const tag of CATEGORY_DEFAULT_TAGS[catNorm]) {
            tagsSet.add(tag);
            if (tagsSet.size >= minTags) break;
        }
    }

    // 4. Fallback
    if (tagsSet.size < minTags) {
        tagsSet.add("rural");
        tagsSet.add("campo");
    }

    return [...Array.from(tagsSet), ...internalTags];
}

async function run() {
    console.log("=== INICIANDO COMPLETADO DE ETIQUETAS EN RURALPOP ===");
    let page = 0;
    const PAGE_SIZE = 1000;
    let hasMore = true;
    const listingsToUpdate = [];

    while (hasMore) {
        const { data, error } = await supabase
            .from("listings")
            .select("id, title, description, category, subcategory, tags, tenant_id")
            .or(`tenant_id.eq.${RURALPOP_TENANT_ID},tenant_id.is.null`)
            .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (error) {
            console.error("Error consultando listings:", error);
            process.exit(1);
        }

        if (!data || data.length === 0) break;

        for (const l of data) {
            const valid = (l.tags || []).filter(t => t && !t.startsWith("_") && t.trim().length > 0);
            if (valid.length < 2) {
                const newTags = ensureMinimumTags({
                    title: l.title,
                    description: l.description,
                    category: l.category,
                    subcategory: l.subcategory,
                    existingTags: l.tags
                });
                listingsToUpdate.push({
                    id: l.id,
                    title: l.title,
                    tags: newTags
                });
            }
        }

        if (data.length < PAGE_SIZE) hasMore = false;
        page++;
    }

    console.log(`Se han encontrado ${listingsToUpdate.length} anuncios de Ruralpop que necesitan tags.`);

    if (listingsToUpdate.length === 0) {
        console.log("Todos los anuncios ya tienen al menos 2 tags. Nada que actualizar.");
        return;
    }

    // Actualización por lotes concurrentes de 50
    const CHUNK_SIZE = 50;
    let processed = 0;

    for (let i = 0; i < listingsToUpdate.length; i += CHUNK_SIZE) {
        const chunk = listingsToUpdate.slice(i, i + CHUNK_SIZE);
        const promises = chunk.map(item =>
            supabase
                .from("listings")
                .update({ tags: item.tags })
                .eq("id", item.id)
        );

        const results = await Promise.all(promises);
        for (const res of results) {
            if (res.error) {
                console.error("Error actualizando anuncio:", res.error);
            }
        }

        processed += chunk.length;
        if (processed % 200 === 0 || processed === listingsToUpdate.length) {
            console.log(`Progreso: ${processed}/${listingsToUpdate.length} anuncios actualizados...`);
        }
    }

    console.log("=== ACTUALIZACIÓN COMPLETADA CON ÉXITO ===");

    // Verificación final en Base de Datos
    page = 0;
    hasMore = true;
    let remainingLessThan2 = 0;

    while (hasMore) {
        const { data } = await supabase
            .from("listings")
            .select("tags, tenant_id")
            .or(`tenant_id.eq.${RURALPOP_TENANT_ID},tenant_id.is.null`)
            .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (!data || data.length === 0) break;

        for (const l of data) {
            const valid = (l.tags || []).filter(t => t && !t.startsWith("_") && t.trim().length > 0);
            if (valid.length < 2) {
                remainingLessThan2++;
            }
        }
        if (data.length < PAGE_SIZE) hasMore = false;
        page++;
    }

    console.log(`Verificación final: Anuncios de Ruralpop con menos de 2 tags: ${remainingLessThan2}`);
}

run();
