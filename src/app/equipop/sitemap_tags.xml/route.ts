import { getEquipopTagsSitemapXml } from '@/utils/sitemapGeneratorEquipop';

export const dynamic = 'force-dynamic';

export async function GET() {
    const xml = await getEquipopTagsSitemapXml();

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
    });
}
