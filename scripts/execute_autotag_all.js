require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const STOP_WORDS = new Set([
    'de', 'del', 'la', 'las', 'el', 'los', 'en', 'con', 'sin', 'por', 'para', 'un', 'una', 'unos', 'unas',
    'y', 'e', 'o', 'u', 'a', 'al', 'se', 'su', 'sus', 'mi', 'mis', 'tu', 'tus', 'nuestro', 'nuestra',
    'es', 'son', 'que', 'da', 'do', 'dos', 'das', 'muy', 'mas', 'más', 'lo', 'les', 'le',
    'vendo', 'vende', 'compro', 'busco', 'oferta', 'precio', 'super', 'gran', 'buen', 'buena', 'buenos', 'buenas',
    'ano', 'anos', 'mes', 'meses', 'dia', 'dias', 'muy', 'bien', 'como', 'esta', 'este', 'esta', 'estos', 'estas'
]);

const CATEGORY_TAG_MAP = {
    'ganaderia': ['ganadería', 'ganado', 'rural', 'campo'],
    'maquinaria': ['maquinaria agrícola', 'herramientas', 'agrícola'],
    'forraje': ['forraje', 'alimentación animal', 'nutrición animal'],
    'fincas': ['finca', 'terreno rural', 'propiedad rural'],
    'agricultura': ['agricultura', 'cultivo', 'agrícola'],
    'servicios': ['servicios rurales', 'mantenimiento'],
    'alimentos': ['alimentos km0', 'producto local', 'km0']
};

function cleanTag(t) {
    if (!t) return null;
    let str = String(t).trim();
    if (!str || str.length < 2) return null;

    // Special system tags to keep intact
    if (str === 'welfare_validated' || str === 'is_equipop' || str === 'profesional') {
        return str;
    }

    // Capitalize first letter nicely
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateTagsForListing(listing) {
    const title = (listing.title || '').trim();
    const category = (listing.category || '').trim().toLowerCase();
    const subcategory = (listing.subcategory || '').trim();
    const description = (listing.description || '').trim();
    const existingTags = Array.isArray(listing.tags) ? listing.tags : [];

    // Map to keep track of lowercased -> formatted tag
    const tagsMap = new Map();

    // Preserve existing tags
    existingTags.forEach(t => {
        const cleaned = cleanTag(t);
        if (cleaned) {
            tagsMap.set(cleaned.toLowerCase(), cleaned);
        }
    });

    // Add subcategory if present
    if (subcategory) {
        const cleanedSub = cleanTag(subcategory);
        if (cleanedSub) tagsMap.set(cleanedSub.toLowerCase(), cleanedSub);
    }

    // Add category tags
    if (category && CATEGORY_TAG_MAP[category]) {
        CATEGORY_TAG_MAP[category].forEach(t => {
            const cleanedCat = cleanTag(t);
            if (cleanedCat) tagsMap.set(cleanedCat.toLowerCase(), cleanedCat);
        });
    } else if (category) {
        const cleanedCat = cleanTag(category);
        if (cleanedCat) tagsMap.set(cleanedCat.toLowerCase(), cleanedCat);
    }

    // Extract meaningful words from Title
    const originalTitleWords = title
        .replace(/[^a-záéíóúñ0-9\s]/gi, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 3 && !STOP_WORDS.has(w.toLowerCase()));

    originalTitleWords.forEach(word => {
        const cleanedWord = cleanTag(word);
        if (cleanedWord && !tagsMap.has(cleanedWord.toLowerCase())) {
            tagsMap.set(cleanedWord.toLowerCase(), cleanedWord);
        }
    });

    // Extract words from description if needed
    if (tagsMap.size < 4 && description) {
        const descWords = description
            .replace(/[^a-záéíóúñ0-9\s]/gi, ' ')
            .split(/\s+/)
            .filter(w => w.length >= 4 && !STOP_WORDS.has(w.toLowerCase()));

        for (const w of descWords) {
            if (tagsMap.size >= 6) break;
            const cleanedW = cleanTag(w);
            if (cleanedW && !tagsMap.has(cleanedW.toLowerCase())) {
                tagsMap.set(cleanedW.toLowerCase(), cleanedW);
            }
        }
    }

    // Fallback if still under 3
    if (tagsMap.size < 3) {
        const fallbacks = ['Ruralpop', 'Anuncio rural', 'Compraventa'];
        fallbacks.forEach(f => {
            if (tagsMap.size < 3 && !tagsMap.has(f.toLowerCase())) {
                tagsMap.set(f.toLowerCase(), f);
            }
        });
    }

    // Return array of 3-7 clean tags
    return Array.from(tagsMap.values()).slice(0, 7);
}

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);

    console.log("=== Starting Autotagging of ALL Ruralpop Listings ===");

    const PAGE_SIZE = 1000;
    let page = 0;
    let totalProcessed = 0;
    let totalUpdated = 0;

    while (true) {
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        console.log(`\nFetching batch ${page + 1} (rows ${from} to ${to})...`);

        const { data: listings, error } = await supabaseAdmin
            .from('listings')
            .select('id, title, category, subcategory, description, tags, status')
            .or('tenant_id.eq.ea2490cc-dc33-48f3-bc7b-82b14aa70eb9,tenant_id.is.null')
            .range(from, to);

        if (error) {
            console.error("Error fetching batch:", error);
            break;
        }

        if (!listings || listings.length === 0) {
            console.log("No more listings found.");
            break;
        }

        totalProcessed += listings.length;

        // Find listings that have < 3 tags
        const needingUpdate = listings.filter(l => !Array.isArray(l.tags) || l.tags.length < 3);

        console.log(`Batch ${page + 1}: ${listings.length} retrieved | ${needingUpdate.length} need tags.`);

        // Process in concurrent sub-chunks of 50
        const CHUNK_SIZE = 50;
        for (let i = 0; i < needingUpdate.length; i += CHUNK_SIZE) {
            const chunk = needingUpdate.slice(i, i + CHUNK_SIZE);
            await Promise.all(
                chunk.map(async (listing) => {
                    const newTags = generateTagsForListing(listing);
                    const { error: updateErr } = await supabaseAdmin
                        .from('listings')
                        .update({ tags: newTags })
                        .eq('id', listing.id);

                    if (updateErr) {
                        console.error(`Error updating listing ${listing.id}:`, updateErr.message);
                    } else {
                        totalUpdated++;
                    }
                })
            );
        }

        console.log(`Batch ${page + 1} completed. Total updated so far: ${totalUpdated}`);

        if (listings.length < PAGE_SIZE) {
            break; // Last page reached
        }

        page++;
    }

    console.log(`\n✅ AUTOTAGGING COMPLETE!`);
    console.log(`Total Ruralpop listings scanned: ${totalProcessed}`);
    console.log(`Total listings updated with >= 3 tags: ${totalUpdated}`);
}

main();
