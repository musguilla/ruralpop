import { CATEGORIES } from "@/constants/categories";
import { LOCATIONS } from "@/constants/locations";

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
    "mantillas-y-sudaderos": "mantillas",
    "cabezadas-y-riendas": "cabezadas",
    "protectores-y-vendas": "protectores",
    "mantas-y-ropa-para-caballos": "mantas-caballos",
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
    "guantes-ecuestres": "guantes",
    "ropa-reflectante-y-seguridad-vial": "ropa-reflectante",
    "fustas-espuelas-y-ayudas": "fustas-espuelas",
    "accesorios-para-riders": "accesorios-riders",
    "equipamiento-de-competicin": "competicion",
    "outdoor-y-lifestyle-ecuestre": "outdoor",
    "bolsas-y-almacenamiento": "bolsas",
    "otros-productos-para-riders": "otros-riders"
};

const SUBCATEGORY_ALIASES: Record<string, string> = {
    "sillas-de-uso-general": "sillas-mixtas",
    "sillas-mixtas-uso-general": "sillas-mixtas",
};

const INVERSE_CATEGORY_ALIASES = Object.fromEntries(
    Object.entries(CATEGORY_ALIASES).map(([k, v]) => [v, k])
);

const INVERSE_SUBCATEGORY_ALIASES = Object.fromEntries(
    Object.entries(SUBCATEGORY_ALIASES).map(([k, v]) => [v, k])
);

export function buildSeoUrl({ q, category, subcategory, province_id }: SeoUrlParams): string {
    const parts: string[] = [];

    // Keyword or base
    if (q && q.trim()) {
        parts.push(slugify(q));
    } else {
        parts.push('anuncios');
    }

    // Category
    if (category && validCategories.has(category)) {
        parts.push(CATEGORY_ALIASES[category] || category);
    }

    // Subcategory
    if (subcategory) {
        const subSlug = subcategoryIdMap.get(subcategory) || slugify(subcategory);
        parts.push(SUBCATEGORY_ALIASES[subSlug] || subSlug);
    }

    // Location
    if (province_id) {
        const locSlug = locationIdMap.get(province_id);
        if (locSlug) parts.push(locSlug);
    }

    // If there were no params and no query, it redirects home
    if (parts.length === 1 && parts[0] === 'anuncios') {
        return '/';
    }

    return `/${parts.join('-')}`;
}

export function parseSeoUrl(slug: string): SeoUrlParams {
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

    // 2. Subcategory check (search backwards)
    let matchedSubSize = 0;
    for (let i = 1; i <= parts.length; i++) {
        const potentialSub = parts.slice(parts.length - i).join('-');
        const realSubSlug = INVERSE_SUBCATEGORY_ALIASES[potentialSub] || potentialSub;
        if (subcategorySlugMap.has(realSubSlug)) {
            subcategory = subcategorySlugMap.get(realSubSlug)!;
            matchedSubSize = i;
        }
    }
    if (matchedSubSize > 0) parts = parts.slice(0, parts.length - matchedSubSize);

    // 3. Category check (search backwards)
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

    // 4. Query is whatever is left
    if (parts.length > 0) {
        const queryText = parts.join('-');
        if (queryText !== 'anuncios') {
            q = parts.join(' '); // Reconstruct search space with spaces
        }
    }

    return { q, category, subcategory, province_id };
}
