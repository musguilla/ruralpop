import { getSitemapXmlById } from '@/utils/sitemapGenerator';

export const dynamic = 'force-dynamic';

export async function GET() {
    const xml = await getSitemapXmlById(4);

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
    });
}
