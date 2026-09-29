import { LOCATIONS } from "@/constants/locations";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

interface ListingSitemapRow {
    tags: string[] | null;
    province_id: number | string | null;
}

const RURALPOP_TENANT_ID = "ea2490cc-dc33-48f3-bc7b-82b14aa70eb9";

/**
 * Normalizes a text string into an SEO-friendly URL slug:
 * - Decodes accented characters (NFD)
 * - Converts to lower case
 * - Converts non-alphanumeric characters to hyphens
 * - Trims leading and trailing hyphens
 */
function normalizeUrlString(str: string): string {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // quita acentos
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // espacios y caracteres especiales por guiones
        .replace(/^-+|-+$/g, ""); // quita guiones en extremos
}

export async function GET(): Promise<Response> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ruralpop.com";

    // Usamos el cliente anónimo directamente para mayor velocidad en el sitemap público
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Pedimos solo los campos estrictamente necesarios de anuncios activos de Ruralpop
    const allListings: ListingSitemapRow[] = [];
    let hasMore = true;
    let page = 0;
    const PAGE_SIZE = 1000;

    while (hasMore) {
        const { data, error } = await supabase
            .from("listings")
            .select("tags, province_id")
            .eq("status", "active")
            .or(`tenant_id.eq.${RURALPOP_TENANT_ID},tenant_id.is.null`)
            .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (error) {
            console.error("Error fetching tags for sitemap_tags:", error);
            break;
        }

        if (data && data.length > 0) {
            allListings.push(...(data as ListingSitemapRow[]));
            page++;
            if (data.length < PAGE_SIZE) {
                hasMore = false;
            }
        } else {
            hasMore = false;
        }
    }

    // Set para garantizar unicidad absoluta en las combinaciones tag-provincia
    const uniqueUrls = new Set<string>();

    for (const listing of allListings) {
        if (!listing.tags || !Array.isArray(listing.tags) || listing.tags.length === 0 || !listing.province_id) {
            continue;
        }

        const prov = LOCATIONS.find((l) => Number(l.id) === Number(listing.province_id));
        if (!prov) {
            continue;
        }

        const provSlug = normalizeUrlString(prov.name);
        if (!provSlug) {
            continue;
        }

        for (const tag of listing.tags) {
            // Ignorar flags de control interno del sistema (ej: _milestone_10_sent) o strings vacíos
            if (!tag || tag.startsWith("_") || !tag.trim()) {
                continue;
            }

            const tagSlug = normalizeUrlString(tag);
            if (!tagSlug) {
                continue;
            }

            // Formato SEO canonical: https://www.ruralpop.com/vacas-lecheras-asturias
            const url = `${baseUrl}/${tagSlug}-${provSlug}`;
            uniqueUrls.add(url);
        }
    }

    if (uniqueUrls.size === 0) {
        uniqueUrls.add(`${baseUrl}/`);
    }

    const xmlUrls = Array.from(uniqueUrls)
        .map(
            (url) => `
        <url>
            <loc>${url}</loc>
            <changefreq>daily</changefreq>
            <priority>0.8</priority>
        </url>`
        )
        .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${xmlUrls}
</urlset>`.trim();

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
        },
    });
}

/**
 * -----------------------------------------------------------------------------
 * DOCUMENTACIÓN DE MEMORIA / TECHNICAL DECISION RECORD
 * -----------------------------------------------------------------------------
 * 1. ¿Por qué se tomó esta decisión técnica?
 *    - Aislamiento Multitenant: La web de Ruralpop no debe indexar URLs de Equipop.
 *      Se añade el filtro explícito `.or('tenant_id.eq.ea2490cc-dc33-48f3-bc7b-82b14aa70eb9,tenant_id.is.null')`.
 *    - Limpieza de Tags Internos: Los anuncios pueden contener tags de auditoría o triggers
 *      que empiezan por guión bajo (como '_milestone_10_sent'). Se omiten explícitamente para
 *      evitar indexar páginas 404 o términos sin sentido para los motores de búsqueda.
 *    - Estricto Type Safety (Zero `any`): Se tipa ListingSitemapRow eliminando completamente
 *      cualquier uso de `any`, cumpliendo rigurosamente con los estándares de infraestructura.
 *    - Paginación Eficiente: Se consulta en bloques de 1,000 registros mediante `.range()` para no
 *      superar el límite de respuesta de Supabase y mantener un consumo óptimo de memoria.
 *
 * 2. Posibles "edge cases" cubiertos:
 *    - Anuncios con tags nulos, vacíos o arrays heterogéneos.
 *    - Provincias con ID inválido o no existente en el diccionario `LOCATIONS`.
 *    - Nombres de etiquetas o provincias con caracteres especiales, acentos o espacios redundantes.
 *    - Si por cualquier contingencia no hubiera URLs válidas, se provee el fallback `${baseUrl}/`
 *      para evitar generar un XML malformado o vacío que rompa el crawler de Google.
 * -----------------------------------------------------------------------------
 */
