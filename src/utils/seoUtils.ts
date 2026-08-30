import { CATEGORIES } from "@/constants/categories";
import { LOCATIONS } from "@/constants/locations";
import { translateSeoSlug } from "@/utils/seoTranslations";

export function slugify(text: string): string {
    return text
        .toString()
        .normalize('NFD')                   // split an accented letter into the base letter and the accent
        .replace(/[\u0300-\u036f]/g, '')    // remove all previously split accents
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')          // replace spaces, non-word characters and dashes with a single dash (-)
        .replace(/^-+|-+$/g, '');           // remove leading and trailing dashes
}

const validCategories = new Set(CATEGORIES.map(c => c.id));

const subcategorySlugMap = new Map<string, string>();
const subcategoryIdMap = new Map<string, string>();

CATEGORIES.forEach(cat => {
    cat.subcategories.forEach(sub => {
        const slug = slugify(sub);
        subcategorySlugMap.set(slug, sub);
        subcategoryIdMap.set(sub, slug);
    });
});

const locationSlugMap = new Map(
    LOCATIONS.map(loc => [slugify(loc.name), loc.id])
);
const locationIdMap = new Map(
    LOCATIONS.map(loc => [loc.id, slugify(loc.name)])
);

interface SeoUrlParams {
    q?: string;
    category?: string;
    subcategory?: string;
    province_id?: string;
}

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

const SUBCATEGORY_ALIASES: Record<string, string> = {
    "sillas-mixtas-uso-general": "sillas-mixtas",
};

const INVERSE_CATEGORY_ALIASES = Object.fromEntries(
    Object.entries(CATEGORY_ALIASES).map(([k, v]) => [v, k])
);

const INVERSE_SUBCATEGORY_ALIASES = Object.fromEntries(
    Object.entries(SUBCATEGORY_ALIASES).map(([k, v]) => [v, k])
);

export function buildSeoUrl({ q, category, subcategory, province_id }: SeoUrlParams, locale: string = 'es'): string {
    const parts: string[] = [];

    // Category
    if (category && validCategories.has(category)) {
        parts.push(translateSeoSlug(CATEGORY_ALIASES[category] || category, locale));
    }

    // Subcategory
    if (subcategory) {
        const subSlug = subcategoryIdMap.get(subcategory) || slugify(subcategory);
        parts.push(translateSeoSlug(SUBCATEGORY_ALIASES[subSlug] || subSlug, locale));
    }

    // Keyword or base
    if (q && q.trim()) {
        parts.push(translateSeoSlug(slugify(q), locale));
    }

    // Location (we usually don't translate location names)
    if (province_id) {
        const locSlug = locationIdMap.get(province_id);
        if (locSlug) parts.push(locSlug);
    }

    const prefix = locale === 'pt' ? '/pt' : '';

    if (parts.length === 0) return prefix || '/';
    
    return `${prefix}/${parts.join('/')}`;
}

export function parseSeoUrl(slug: string | string[]): SeoUrlParams {
    let parts = Array.isArray(slug) ? slug.join('-').split('-') : slug.split('-');

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

    // 3. Subcategory parsing (search from beginning to support /category/subcategory/keyword)
    const checkSub = (arr: string[]) => {
        for (let i = arr.length; i >= 1; i--) {
            const potentialSub = arr.slice(0, i).join('-');
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
            subParts = subParts.slice(subMatch.size);
            qParts = [...qParts, ...subParts]; 
        } else {
            qParts = [...qParts, ...subParts];
        }
    } else {
        const subMatch = checkSub(qParts);
        if (subMatch) {
            subcategory = subMatch.sub;
            qParts = qParts.slice(subMatch.size);
        }
    }

    // 4. Query is whatever is left
    if (qParts.length > 0) {
        const queryText = qParts.join('-');
        if (queryText !== 'anuncios') {
            if (qParts[0] === 'anuncios') {
                q = qParts.slice(1).join(' ');
            } else {
                q = qParts.join(' ');
            }
        }
    }

    return { q, category, subcategory, province_id };
}
