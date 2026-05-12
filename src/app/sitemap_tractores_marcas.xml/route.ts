import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ruralpop.com';
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const addEntry = (path: string, priority: number = 0.8) => {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}${path}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>${priority}</priority>\n`;
        xml += `  </url>\n`;
    };

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    addEntry('/tractores', 0.9);

    try {
        const { data: brands, error: brandsError } = await supabase
            .from('tractor_brands')
            .select('slug, updated_at')
            .eq('is_active', true);

        if (brands && !brandsError) {
            for (const brand of brands) {
                xml += `  <url>\n`;
                xml += `    <loc>${baseUrl}/tractores/${brand.slug}</loc>\n`;
                xml += `    <lastmod>${new Date(brand.updated_at || new Date()).toISOString()}</lastmod>\n`;
                xml += `    <changefreq>weekly</changefreq>\n`;
                xml += `    <priority>0.8</priority>\n`;
                xml += `  </url>\n`;
            }
        }
    } catch (err) {
        console.error("Sitemap Tractores Marcas: Error fetching data", err);
    }

    xml += `</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
    });
}
