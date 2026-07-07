import { CATEGORIES } from "./src/constants/categories";

const validCategories = new Set(CATEGORIES.map(c => c.id));

const CATEGORY_ALIASES: Record<string, string> = {
    "sillas-de-montar-y-accesorios": "sillas-de-montar",
    "mantillas-y-salvacruces": "mantillas",
    "cabezadas-y-riendas": "cabezadas",
    "protectores-y-vendas": "protectores",
    "mantas": "mantas-caballos",
    "cuidado-e-higiene-del-caballo": "cuidado-caballo",
    "alimentacin-y-suplementos": "alimentacion",
    "herrado-y-cascos": "herrado",
    "trabajo-pie-a-tierra-y-entrenamiento": "trabajo-pie-a-tierra",
    "transporte-y-viaje": "transporte",
    "seguridad-y-visibilidad": "seguridad",
    "equipamiento-mdico-y-recuperacin": "equipamiento-medico",
    "establo-y-cuadra": "establo",
    "reproduccin-y-cra": "reproduccion",
    "otros-productos-para-caballos": "otros-caballos",
    "calzado-ecuestre": "calzado",
    "cascos-y-seguridad": "cascos",
    "ropa-ecuestre-mujer": "ropa-mujer",
    "ropa-ecuestre-hombre": "ropa-hombre",
    "ropa-ecuestre-infantil": "ropa-infantil",
    "fustas-espuelas-y-ayudas": "fustas-espuelas",
    "accesorios-para-riders": "accesorios-riders",
    "otros-productos-para-riders": "otros-riders"
};

const INVERSE_CATEGORY_ALIASES = Object.fromEntries(
    Object.entries(CATEGORY_ALIASES).map(([k, v]) => [v, k])
);

export function slugify(text: string): string {
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const subcategorySlugMap = new Map<string, string>();
CATEGORIES.forEach(cat => {
    cat.subcategories.forEach(sub => {
        const slug = slugify(sub);
        subcategorySlugMap.set(slug, sub);
    });
});
const INVERSE_SUBCATEGORY_ALIASES: Record<string, string> = {
    "sillas-de-uso-general": "sillas-mixtas"
};
const locationSlugMap = new Map(); // dummy

export function parseSeoUrl(slug: string) {
    let parts = slug.split('-');

    let province_id = "";
    let category = "";
    let subcategory = "";
    let q = "";

    // 1. Location check (search backwards)
    let matchedLocSize = 0;
    for (let i = 1; i <= parts.length; i++) {
        const potentialLoc = parts.slice(parts.length - i).join('-');
        if (locationSlugMap.has(potentialLoc)) {
            province_id = locationSlugMap.get(potentialLoc)!;
            matchedLocSize = i;
        }
    }
    if (matchedLocSize > 0) parts = parts.slice(0, parts.length - matchedLocSize);

    // 2. Exact Category parsing
    const remainingStr = parts.join('-');
    const allCatSlugs = [...validCategories, ...Object.values(CATEGORY_ALIASES)]
        .sort((a, b) => b.length - a.length); // longest first
        
    let foundCatSlug = "";
    let matchIdx = -1;
    let catSlugParts: string[] = [];

    for (const catSlug of allCatSlugs) {
        if (
            remainingStr === catSlug ||
            remainingStr.includes(`-${catSlug}-`) ||
            remainingStr.endsWith(`-${catSlug}`) ||
            remainingStr.startsWith(`${catSlug}-`)
        ) {
            foundCatSlug = catSlug;
            catSlugParts = catSlug.split('-');
            
            // Find EXACT index in parts array
            for (let i = 0; i <= parts.length - catSlugParts.length; i++) {
                let match = true;
                for (let j = 0; j < catSlugParts.length; j++) {
                    if (parts[i + j] !== catSlugParts[j]) {
                        match = false; break;
                    }
                }
                if (match) {
                    matchIdx = i; break;
                }
            }
            if (matchIdx !== -1) break; // Found exact array match
        }
    }

    let qParts: string[] = [];
    let subParts: string[] = [];

    if (matchIdx !== -1) {
        category = INVERSE_CATEGORY_ALIASES[foundCatSlug] || foundCatSlug;
        qParts = parts.slice(0, matchIdx);
        subParts = parts.slice(matchIdx + catSlugParts.length);
    } else {
        qParts = parts;
    }

    // 3. Subcategory parsing (always backwards, prefer subParts but fallback to qParts)
    const checkSub = (arr: string[]) => {
        for (let i = 1; i <= arr.length; i++) {
            const potentialSub = arr.slice(arr.length - i).join('-');
            const realSubSlug = INVERSE_SUBCATEGORY_ALIASES[potentialSub] || potentialSub;
            if (subcategorySlugMap.has(realSubSlug)) {
                return { sub: subcategorySlugMap.get(realSubSlug)!, size: i };
            }
        }
        return null;
    };

    if (subParts.length > 0) {
        const subMatch = checkSub(subParts);
        if (subMatch) {
            subcategory = subMatch.sub;
            subParts = subParts.slice(0, subParts.length - subMatch.size);
            // Any remaining subParts are merged back into query just in case, 
            // though typically there shouldn't be any.
            qParts = [...qParts, ...subParts]; 
        } else {
            // No subcategory found in subParts, treat them as query? 
            qParts = [...qParts, ...subParts];
        }
    } else {
        const subMatch = checkSub(qParts);
        if (subMatch) {
            subcategory = subMatch.sub;
            qParts = qParts.slice(0, qParts.length - subMatch.size);
        }
    }

    // 4. Query
    if (qParts.length > 0) {
        const queryText = qParts.join('-');
        if (queryText !== 'anuncios') {
            // Strip leading 'anuncios' if it exists to be clean
            if (qParts[0] === 'anuncios') {
                q = qParts.slice(1).join(' ');
            } else {
                q = qParts.join(' ');
            }
        }
    }

    return { q, category, subcategory, province_id };
}

console.log('--- TEST CASES ---');
console.log('1.', parseSeoUrl('anuncios-mantillas-y-salvacruces'));
console.log('2.', parseSeoUrl('anuncios-sillas-de-montar-sillas-de-salto'));
console.log('3.', parseSeoUrl('anuncios-mantas-impermeables'));
console.log('4.', parseSeoUrl('anuncios-cabezada-mantillas'));
console.log('5.', parseSeoUrl('anuncios-cabezadas'));
console.log('6.', parseSeoUrl('cabezadas-de-trabajo-sillas-de-montar-sillas-de-salto'));
