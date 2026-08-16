require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Common Spanish stop words to exclude when extracting tags from titles
const STOP_WORDS = new Set([
    'de', 'del', 'la', 'las', 'el', 'los', 'en', 'con', 'sin', 'por', 'para', 'un', 'una', 'unos', 'unas',
    'y', 'e', 'o', 'u', 'a', 'al', 'se', 'su', 'sus', 'mi', 'mis', 'tu', 'tus', 'nuestro', 'nuestra',
    'es', 'son', 'que', 'en', 'da', 'do', 'da', 'dos', 'das', 'muy', 'mas', 'más', 'lo', 'les', 'le',
    'vendo', 'se', 'vende', 'compro', 'busco', 'oferta', 'precio', 'super', 'gran', 'buen', 'buena', 'buenos', 'buenas'
]);

// Category mapping helper to get additional domain tags
const CATEGORY_TAG_MAP = {
    'ganaderia': ['ganadería', 'ganado', 'rural', 'campo'],
    'maquinaria': ['maquinaria agrícola', 'herramientas', 'maquinaria', 'agrícola'],
    'forraje': ['forraje', 'alimentación animal', 'nutrición animal', 'pienso'],
    'fincas': ['finca', 'terreno rural', 'propiedad rural', 'inmueble rural'],
    'agricultura': ['agricultura', 'cultivo', 'campo', 'agrícola'],
    'servicios': ['servicios rurales', 'mantenimiento', 'profesional rural'],
    'alimentos': ['alimentos km0', 'producto local', 'artesanal', 'km0']
};

function generateTagsForListing(listing) {
    const title = (listing.title || '').trim();
    const category = (listing.category || '').trim().toLowerCase();
    const subcategory = (listing.subcategory || '').trim();
    const description = (listing.description || '').trim();
    const existingTags = Array.isArray(listing.tags) ? listing.tags : [];

    const tagsSet = new Set(existingTags.map(t => String(t).trim()));

    // 1. Add subcategory if present
    if (subcategory) {
        tagsSet.add(subcategory);
    }

    // 2. Add category tags
    if (category && CATEGORY_TAG_MAP[category]) {
        CATEGORY_TAG_MAP[category].forEach(t => tagsSet.add(t));
    } else if (category) {
        tagsSet.add(category);
    }

    // 3. Extract meaningful words from Title
    const titleWords = title
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents for tokenizing, but keep readable words
        .replace(/[^a-z0-9áéíóúñ\s]/gi, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 3 && !STOP_WORDS.has(w));

    // Also extract clean words with accents from original title
    const originalTitleWords = title
        .replace(/[^a-záéíóúñ0-9\s]/gi, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 3 && !STOP_WORDS.has(w.toLowerCase()));

    originalTitleWords.forEach(word => {
        if (word.length >= 3) {
            tagsSet.add(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
        }
    });

    // 4. Extract domain keywords from description if tags are still fewer than 5
    if (tagsSet.size < 5 && description) {
        const descWords = description
            .replace(/[^a-záéíóúñ0-9\s]/gi, ' ')
            .split(/\s+/)
            .filter(w => w.length >= 4 && !STOP_WORDS.has(w.toLowerCase()));

        for (const w of descWords) {
            if (tagsSet.size >= 6) break;
            tagsSet.add(w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
        }
    }

    // Final fallback to ensure at least 3-4 tags
    if (tagsSet.size < 3) {
        tagsSet.add('Ruralpop');
        tagsSet.add('Anuncio rural');
        tagsSet.add('Compraventa');
    }

    return Array.from(tagsSet).slice(0, 7); // Clean list of 3-7 tags
}

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);

    console.log("=== Fetching Ruralpop listings needing tags ===");

    // Fetch all active listings first
    let { data: listings, error } = await supabaseAdmin
        .from('listings')
        .select('id, title, category, subcategory, description, tags, status')
        .or('tenant_id.eq.ea2490cc-dc33-48f3-bc7b-82b14aa70eb9,tenant_id.is.null');

    if (error) {
        console.error("Fetch error:", error);
        return;
    }

    console.log(`Total Ruralpop listings retrieved: ${listings?.length}`);

    // Filter listings with missing or < 3 tags
    const needingTags = listings.filter(l => !Array.isArray(l.tags) || l.tags.length < 3);
    console.log(`Listings needing tags (< 3 tags): ${needingTags.length}`);

    const activeNeedingTags = needingTags.filter(l => l.status === 'active');
    console.log(`Active listings needing tags: ${activeNeedingTags.length}`);

    // Print sample generated tags for verification
    console.log("\n=== Sample Generated Tags for 5 Listings ===");
    for (let i = 0; i < Math.min(5, needingTags.length); i++) {
        const sample = needingTags[i];
        const generated = generateTagsForListing(sample);
        console.log(`[${sample.status.toUpperCase()}] Title: "${sample.title}" | Category: ${sample.category} > ${sample.subcategory}`);
        console.log(`Old tags:`, sample.tags);
        console.log(`New tags:`, generated);
        console.log("-----------------------------------------");
    }
}

main();
