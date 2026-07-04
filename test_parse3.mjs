const slugify = (text) => text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');
const validCategories = new Set(["sillas-de-montar-y-accesorios"]);
const subcategorySlugMap = new Map([["sillas-de-uso-general", "Sillas de uso general"]]);
const CATEGORY_ALIASES = { "sillas-de-montar-y-accesorios": "sillas-de-montar" };
const SUBCATEGORY_ALIASES = { "sillas-de-uso-general": "sillas-mixtas" };
const INVERSE_CATEGORY_ALIASES = Object.fromEntries(Object.entries(CATEGORY_ALIASES).map(([k, v]) => [v, k]));
const INVERSE_SUBCATEGORY_ALIASES = Object.fromEntries(Object.entries(SUBCATEGORY_ALIASES).map(([k, v]) => [v, k]));

function parseSeoUrl(slug) {
    let parts = slug.split('-');
    let province_id = "", category = "", subcategory = "", q = "";

    let matchedSubSize = 0;
    for (let i = 1; i <= parts.length; i++) {
        const potentialSub = parts.slice(parts.length - i).join('-');
        const realSubSlug = INVERSE_SUBCATEGORY_ALIASES[potentialSub] || potentialSub;
        if (subcategorySlugMap.has(realSubSlug)) {
            subcategory = subcategorySlugMap.get(realSubSlug);
            matchedSubSize = i;
        }
    }
    if (matchedSubSize > 0) parts = parts.slice(0, parts.length - matchedSubSize);

    let matchedCatSize = 0;
    for (let i = 1; i <= parts.length; i++) {
        const potentialCat = parts.slice(parts.length - i).join('-');
        const realCatSlug = INVERSE_CATEGORY_ALIASES[potentialCat] || potentialCat;
        if (validCategories.has(realCatSlug)) {
            category = realCatSlug;
            matchedCatSize = i;
        }
    }
    if (matchedCatSize > 0) parts = parts.slice(0, parts.length - matchedCatSize);

    if (parts.length > 0) {
        const queryText = parts.join('-');
        if (queryText !== 'anuncios') q = parts.join(' ');
    }
    return { q, category, subcategory, province_id };
}

console.log(parseSeoUrl("anuncios-sillas-de-montar-sillas-mixtas"));
