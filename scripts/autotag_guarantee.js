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
    'ganaderia': ['Ganadería', 'Ganado', 'Rural', 'Campo'],
    'maquinaria': ['Maquinaria agrícola', 'Herramientas', 'Agro'],
    'forraje': ['Forraje', 'Alimentación animal', 'Nutrición animal'],
    'fincas': ['Finca', 'Terreno rural', 'Propiedad rural'],
    'agricultura': ['Agricultura', 'Cultivo', 'Agro'],
    'servicios': ['Servicios rurales', 'Mantenimiento'],
    'alimentos': ['Alimentos km0', 'Producto local', 'Km0']
};

function cleanTag(t) {
    if (!t) return null;
    let str = String(t).trim();
    if (!str || str.length < 2) return null;

    if (str === 'welfare_validated' || str === 'is_equipop' || str === 'profesional') {
        return str;
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateStrictTags(listing) {
    const title = (listing.title || '').trim();
    const category = (listing.category || '').trim().toLowerCase();
    const subcategory = (listing.subcategory || '').trim();
    const description = (listing.description || '').trim();
    const existingTags = Array.isArray(listing.tags) ? listing.tags : [];

    const tagsMap = new Map();

    existingTags.forEach(t => {
        const cleaned = cleanTag(t);
        if (cleaned) tagsMap.set(cleaned.toLowerCase(), cleaned);
    });

    if (subcategory) {
        const cleanedSub = cleanTag(subcategory);
        if (cleanedSub) tagsMap.set(cleanedSub.toLowerCase(), cleanedSub);
    }

    if (category && CATEGORY_TAG_MAP[category]) {
        CATEGORY_TAG_MAP[category].forEach(t => {
            const cleanedCat = cleanTag(t);
            if (cleanedCat) tagsMap.set(cleanedCat.toLowerCase(), cleanedCat);
        });
    } else if (category) {
        const cleanedCat = cleanTag(category);
        if (cleanedCat) tagsMap.set(cleanedCat.toLowerCase(), cleanedCat);
    }

    const titleWords = title
        .replace(/[^a-záéíóúñ0-9\s]/gi, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 2 && !STOP_WORDS.has(w.toLowerCase()));

    titleWords.forEach(word => {
        const cleanedWord = cleanTag(word);
        if (cleanedWord && !tagsMap.has(cleanedWord.toLowerCase())) {
            tagsMap.set(cleanedWord.toLowerCase(), cleanedWord);
        }
    });

    if (description) {
        const descWords = description
            .replace(/[^a-záéíóúñ0-9\s]/gi, ' ')
            .split(/\s+/)
            .filter(w => w.length >= 3 && !STOP_WORDS.has(w.toLowerCase()));

        for (const w of descWords) {
            if (tagsMap.size >= 6) break;
            const cleanedW = cleanTag(w);
            if (cleanedW && !tagsMap.has(cleanedW.toLowerCase())) {
                tagsMap.set(cleanedW.toLowerCase(), cleanedW);
            }
        }
    }

    // MANDATORY FALLBACK: Ensure EVERY listing gets at least 3-5 tags
    const mandatoryFallbacks = ['Ruralpop', 'Anuncio rural', 'Compraventa', 'Mercado rural', 'Ocasión'];
    for (const fb of mandatoryFallbacks) {
        if (tagsMap.size >= 3) break;
        if (!tagsMap.has(fb.toLowerCase())) {
            tagsMap.set(fb.toLowerCase(), fb);
        }
    }

    return Array.from(tagsMap.values()).slice(0, 7);
}

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);

    console.log("=== Guaranteeing >= 3 tags for ALL Ruralpop listings ===");

    const PAGE_SIZE = 1000;
    let page = 0;
    let totalUpdated = 0;

    while (true) {
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data: listings, error } = await supabaseAdmin
            .from('listings')
            .select('id, title, category, subcategory, description, tags, status')
            .or('tenant_id.eq.ea2490cc-dc33-48f3-bc7b-82b14aa70eb9,tenant_id.is.null')
            .range(from, to);

        if (error || !listings || listings.length === 0) break;

        const needingUpdate = listings.filter(l => !Array.isArray(l.tags) || l.tags.length < 3);

        const CHUNK_SIZE = 50;
        for (let i = 0; i < needingUpdate.length; i += CHUNK_SIZE) {
            const chunk = needingUpdate.slice(i, i + CHUNK_SIZE);
            await Promise.all(
                chunk.map(async (listing) => {
                    const newTags = generateStrictTags(listing);
                    const { error: updateErr } = await supabaseAdmin
                        .from('listings')
                        .update({ tags: newTags })
                        .eq('id', listing.id);

                    if (!updateErr) totalUpdated++;
                })
            );
        }

        if (listings.length < PAGE_SIZE) break;
        page++;
    }

    console.log(`✅ GUARANTEE COMPLETE! Total listings updated: ${totalUpdated}`);
}

main();
