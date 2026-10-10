import { headers } from "next/headers";
import { LOCATIONS } from "@/constants/locations";
import { createClient } from "@supabase/supabase-js";
import { ensureMinimumTags } from "@/utils/tagUtils";

export const dynamic = "force-dynamic";

interface ListingSitemapRow {
    id: string;
    title: string | null;
    description: string | null;
    category: string | null;
    subcategory: string | null;
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
    const headersList = await headers();
    const host = headersList.get("host") || headersList.get("x-forwarded-host") || "";
    const isPtDomain = host.includes("ruralpop.pt");

    const baseUrl = isPtDomain
        ? "https://www.ruralpop.pt"
        : (process.env.NEXT_PUBLIC_SITE_URL || "https://www.ruralpop.com");

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
            .select("id, title, description, category, subcategory, tags, province_id")
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
        if (!listing.province_id) {
            continue;
        }

        const provId = Number(listing.province_id);
        const prov = LOCATIONS.find((l) => Number(l.id) === provId);
        if (!prov) {
            continue;
        }

        // Filtro geográfico estricto por dominio:
        // En ruralpop.pt solo se incluyen provincias/distritos de Portugal (ID >= 100)
        // En ruralpop.com solo se incluyen provincias de España (ID < 100)
        const isPtLoc = provId >= 100;
        if (isPtDomain !== isPtLoc) {
            continue;
        }

        const provSlug = normalizeUrlString(prov.name);
        if (!provSlug) {
            continue;
        }

        // Asegurar que cuente con al menos 2 tags en el sitemap dinámico
        const validExisting = (listing.tags || []).filter(
            (t) => typeof t === "string" && !t.startsWith("_") && t.trim().length > 0
        );

        let finalTags = listing.tags || [];
        if (validExisting.length < 2) {
            finalTags = ensureMinimumTags({
                title: listing.title,
                description: listing.description,
                category: listing.category,
                subcategory: listing.subcategory,
                existingTags: listing.tags,
            });
        }

        for (const tag of finalTags) {
            // Ignorar flags de control interno del sistema (ej: _milestone_10_sent) o strings vacíos
            if (!tag || tag.startsWith("_") || !tag.trim()) {
                continue;
            }

            const tagSlug = normalizeUrlString(tag);
            if (!tagSlug) {
                continue;
            }

            // Formato SEO canonical: https://www.ruralpop.com/vacas-lecheras-asturias o https://www.ruralpop.pt/tratores-leiria
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
 *    - Segmentación por Dominio (.com vs .pt):
 *      Se detecta el host de la petición. En ruralpop.com solo se indexan ubicaciones españolas (ID < 100).
 *      En ruralpop.pt solo se indexan distritos portugueses (ID >= 100). Esto previene canibalización SEO
 *      y asegura que Google indexe URLs 100% relevantes en el dominio geográfico correspondiente.
 *    - Garantía Dinámica de 2+ Tags:
 *      Si algún anuncio activo en BD carece temporalmente de etiquetas (< 2), el sitemap invoca
 *      `ensureMinimumTags` al vuelo para garantizar que todas las combinaciones semánticas se indexen.
 *    - Aislamiento Multitenant: La web de Ruralpop no indexa URLs de Equipop.
 *      Se añade el filtro explícito `.or('tenant_id.eq.ea2490cc-dc33-48f3-bc7b-82b14aa70eb9,tenant_id.is.null')`.
 *    - Limpieza de Tags Internos: Los anuncios con tags de auditoría (ej: '_milestone_10_sent') se ignoran
 *      para no generar páginas 404 ni ensuciar el sitemap de Google.
 *    - Zero `any`: Totalmente tipado con `ListingSitemapRow` y `ensureMinimumTags`.
 * -----------------------------------------------------------------------------
 */
