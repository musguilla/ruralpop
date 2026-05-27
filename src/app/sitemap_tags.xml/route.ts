import { LOCATIONS } from "@/constants/locations";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ruralpop.com';

    // Usamos el cliente anónimo directamente para mayor velocidad en el sitemap
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Pedimos solo los campos estrictamente necesarios de anuncios activos
    const { data: listings, error } = await supabase
        .from('listings')
        .select('tags, province_id')
        .eq('status', 'active');

    if (error || !listings) {
        console.error("Error fetching tags for sitemap:", error);
        return new Response('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
            headers: { 'Content-Type': 'application/xml' }
        });
    }

    // Usamos un Set para asegurar que no mandamos combinaciones duplicadas a Google
    const uniqueUrls = new Set<string>();

    const normalizeUrlString = (str: string) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // quita acentos
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // espacios y raros por guiones
            .replace(/^-+|-+$/g, ''); // quita guiones en extremos
    };

    for (const listing of listings) {
        if (listing.tags && Array.isArray(listing.tags) && listing.tags.length > 0 && listing.province_id) {
            const prov = LOCATIONS.find(l => l.id === listing.province_id);
            if (prov) {
                const provSlug = normalizeUrlString(prov.name);
                for (const tag of listing.tags) {
                    const tagSlug = normalizeUrlString(tag);
                    // Formato: /vacas-lecheras-asturias
                    const url = `${baseUrl}/${tagSlug}-${provSlug}`;
                    uniqueUrls.add(url);
                }
            }
        }
    }

    const xmlUrls = Array.from(uniqueUrls).map(url => `
        <url>
            <loc>${url}</loc>
            <changefreq>daily</changefreq>
            <priority>0.8</priority>
        </url>
    `).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${xmlUrls}
    </urlset>`.trim();

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
        },
    });
}
