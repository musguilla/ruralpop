import { seoDictionaryES } from "./seo/i18n/es";
import { seoDictionaryPT } from "./seo/i18n/pt";
import { LocaleCode } from "@/i18n/config";
import { CATEGORIES } from "@/constants/categories";

export function generateSeoH1(
    parsedSlug: { q?: string, category?: string, subcategory?: string },
    locationName: string = "",
    locale: string = "es",
    tenant?: string | null
) {
    const dict = locale === "pt" ? seoDictionaryPT : seoDictionaryES;
    const { q, category, subcategory } = parsedSlug;
    let h1 = "";

    if (q) {
        // palabra de la URL o búsqueda en plural + en venta
        const pluralizedQ = dict.pluralize(q);
        h1 = `${pluralizedQ} ${dict.inSale}`;
    } else if (subcategory) {
        const sub = subcategory.toLowerCase();
        
        // Ganadería
        if (sub === "bovino") h1 = dict.livestockCattle;
        else if (sub === "equino") h1 = dict.livestockEquine;
        else if (sub === "caprino") h1 = dict.livestockGoat;
        else if (sub === "ovino") h1 = dict.livestockSheep;
        else if (sub === "porcino") h1 = dict.livestockPig;
        else if (sub === "avicultura") h1 = dict.poultry;
        else if (sub === "apicultura") h1 = dict.beekeeping;
        else if (sub === "perros") h1 = dict.dogs;
        else if (sub === "conejos") h1 = dict.rabbits;
        // Servicios
        else if (sub === "transporte") h1 = dict.transport;
        else if (sub === "veterinarios") h1 = dict.vets;
        else if (sub === "herradores") h1 = dict.blacksmiths;
        else if (category === "maquinaria") {
            h1 = dict.machineryUsed.replace('{subcategory}', subcategory);
        } else {
            h1 = dict.adsOf.replace('{subcategory}', subcategory);
        }
    } else if (category) {
        const cat = category.toLowerCase();
        if (cat === "maquinaria") h1 = dict.categoryMachinery;
        else if (cat === "fincas") h1 = dict.categoryEstates;
        else if (cat === "forraje") h1 = dict.categoryFodder;
        else if (cat === "alimentos") h1 = dict.categoryFood;
        else if (cat === "ganaderia") h1 = dict.categoryLivestock;
        else if (cat === "servicios") h1 = dict.categoryServices;
        else {
            const catLabel = CATEGORIES.find(c => c.id === category)?.label || category;
            h1 = dict.categoryAdsOf.replace('{category}', catLabel.toLowerCase());
        }
    } else {
        h1 = tenant === "equipop" ? dict.defaultGlobalEquipop : dict.defaultGlobal;
    }

    if (h1 && h1.length > 0) {
        h1 = h1.charAt(0).toUpperCase() + h1.slice(1);
    }

    if (locationName) {
        h1 += ` ${dict.getPreposition(locationName)}`;
    }

    return h1;
}

/**
 * Documentación de Memoria:
 * 
 * - ¿Por qué se tomó esta decisión técnica?
 *   Se extendió `generateSeoH1` con el parámetro opcional `tenant?: string`. Cuando la ruta no tiene filtro por
 *   búsqueda (`q`), categoría ni subcategoría (por ejemplo al pulsar en 'Ver todos' o `/?sort=recent`),
 *   el título H1 por defecto se bifurca de manera limpia:
 *   - Si `tenant === 'equipop'`, se muestra 'Anuncios material hípico' (o 'Anúncios material hípico' en PT).
 *   - Si es Ruralpop (o cualquier otro valor / omitido), se preserva intacto 'Anuncios clasificados del mundo rural'.
 * 
 * - Posibles "edge cases" cubiertos:
 *   - Omitir `tenant` no rompe ningún llamado existente ni test unitario heredado (retrocompatibilidad garantizada).
 *   - Se preserva la concatenación geográfica (`locationName`) produciendo 'Anuncios material hípico en [Provincia]'.
 *   - Los diccionarios i18n ES y PT administran la traducción centralizada sin cadenas 'hardcoded' arbitrarias en la vista.
 */
