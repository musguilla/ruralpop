import { headers } from "next/headers";

export async function GET() {
    const headersList = await headers();
    const host = headersList.get('host') || headersList.get('x-forwarded-host') || '';
    const isPtDomain = host.includes('ruralpop.pt');
    const baseUrl = isPtDomain ? 'https://www.ruralpop.pt' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ruralpop.com');
    const sitemapPrefix = isPtDomain ? '' : '/pt';
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
        <loc>${baseUrl}${sitemapPrefix}/sitemap_pt_0.xml</loc>
    </sitemap>
    <sitemap>
        <loc>${baseUrl}${sitemapPrefix}/sitemap_pt_1.xml</loc>
    </sitemap>
    <sitemap>
        <loc>${baseUrl}${sitemapPrefix}/sitemap_pt_2.xml</loc>
    </sitemap>
    <sitemap>
        <loc>${baseUrl}${sitemapPrefix}/sitemap_pt_3.xml</loc>
    </sitemap>
    <sitemap>
        <loc>${baseUrl}${sitemapPrefix}/sitemap_pt_4.xml</loc>
    </sitemap>
</sitemapindex>`.trim();

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
        },
    });
}
