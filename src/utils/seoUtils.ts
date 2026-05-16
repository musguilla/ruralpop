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

export function buildSeoUrl({ q, category, subcategory, province_id }: SeoUrlParams): string {
    // Mapeo especial eliminado para usar la URL larga estándar /anuncios-[categoria]-[subcategoria]

    const parts: string[] = [];

    // Keyword or base
    if (q && q.trim()) {
        parts.push(slugify(q));
    } else {
        parts.push('anuncios');
    }

    // Category
    if (category && validCategories.has(category)) {
        parts.push(category);
    }

    // Subcategory
    if (subcategory) {
        const subSlug = subcategoryIdMap.get(subcategory);
        if (subSlug) parts.push(subSlug);
        else parts.push(slugify(subcategory)); // Default fallback
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
    for (let i = 1; i <= Math.min(parts.length, 5); i++) {
        const potentialLoc = parts.slice(parts.length - i).join('-');
        if (locationSlugMap.has(potentialLoc)) {
            province_id = locationSlugMap.get(potentialLoc)!;
            matchedLocSize = i;
        }
    }
    if (matchedLocSize > 0) parts = parts.slice(0, parts.length - matchedLocSize);

    // 2. Subcategory check (search backwards)
    let matchedSubSize = 0;
    for (let i = 1; i <= Math.min(parts.length, 3); i++) {
        const potentialSub = parts.slice(parts.length - i).join('-');
        if (subcategorySlugMap.has(potentialSub)) {
            subcategory = subcategorySlugMap.get(potentialSub)!;
            matchedSubSize = i;
        }
    }
    if (matchedSubSize > 0) parts = parts.slice(0, parts.length - matchedSubSize);

    // 3. Category check (search backwards)
    let matchedCatSize = 0;
    for (let i = 1; i <= Math.min(parts.length, 3); i++) {
        const potentialCat = parts.slice(parts.length - i).join('-');
        if (validCategories.has(potentialCat)) {
            category = potentialCat;
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
