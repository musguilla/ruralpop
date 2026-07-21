export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_EQUIPOP_URL || 'https://www.equipop.app';
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
        <loc>${baseUrl}/sitemap_0.xml</loc>
    </sitemap>
    <sitemap>
        <loc>${baseUrl}/sitemap_tags.xml</loc>
    </sitemap>
</sitemapindex>`.trim();

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
        },
    });
}
