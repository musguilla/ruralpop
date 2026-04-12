import { getSitemapXmlById } from '@/utils/sitemapGenerator';

export const dynamic = 'force-dynamic';

export async function GET() {
    const xml = await getSitemapXmlById(0);

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            // Allow Vercel Edge caching to speed up subsequent requests without hitting Supabase again frequently
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
    });
}
