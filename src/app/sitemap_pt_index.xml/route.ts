export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ruralpop.com';
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
        <loc>${baseUrl}/pt/sitemap_pt_0.xml</loc>
    </sitemap>
    <sitemap>
        <loc>${baseUrl}/pt/sitemap_pt_1.xml</loc>
    </sitemap>
    <sitemap>
        <loc>${baseUrl}/pt/sitemap_pt_2.xml</loc>
    </sitemap>
    <sitemap>
        <loc>${baseUrl}/pt/sitemap_pt_3.xml</loc>
    </sitemap>
    <sitemap>
        <loc>${baseUrl}/pt/sitemap_pt_4.xml</loc>
    </sitemap>
</sitemapindex>`.trim();

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
        },
    });
}
