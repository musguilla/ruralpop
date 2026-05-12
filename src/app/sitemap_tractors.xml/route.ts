export const dynamic = 'force-dynamic';

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ruralpop.com';
    const date = new Date().toISOString();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
        <loc>${baseUrl}/tractores</loc>
        <lastmod>${date}</lastmod>
    </sitemap>
    <sitemap>
        <loc>${baseUrl}/sitemap_tractores_marcas.xml</loc>
        <lastmod>${date}</lastmod>
    </sitemap>
    <sitemap>
        <loc>${baseUrl}/sitemap_tractores_modelos_1.xml</loc>
        <lastmod>${date}</lastmod>
    </sitemap>
    <sitemap>
        <loc>${baseUrl}/sitemap_tractores_features.xml</loc>
        <lastmod>${date}</lastmod>
    </sitemap>
    <sitemap>
        <loc>${baseUrl}/sitemap_tractores_combinaciones_1.xml</loc>
        <lastmod>${date}</lastmod>
    </sitemap>
</sitemapindex>`;

    return new Response(xml.trim(), {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
    });
}
