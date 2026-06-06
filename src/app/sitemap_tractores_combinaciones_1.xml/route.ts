import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic SSR
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; 

        const supabase = createClient(supabaseUrl, supabaseKey);
        const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ruralpop.com';

        let sitemapEntries = '';

        let allPages: any[] = [];
        let from = 0;
        const limit = 1000;

        while (true) {
            const { data: pages, error } = await supabase
                .from('tractor_combination_pages')
                .select('url_path, updated_at, last_generated_at')
                .eq('indexable', true)
                .range(from, from + limit - 1);

            if (error || !pages || pages.length === 0) break;
            
            allPages = allPages.concat(pages);
            
            if (pages.length < limit) break;
            from += limit;
        }

        for (const page of allPages) {
            const date = page.last_generated_at || page.updated_at || new Date().toISOString();
            sitemapEntries += `
                <url>
                    <loc>${SITE_URL}${page.url_path}</loc>
                    <lastmod>${new Date(date).toISOString()}</lastmod>
                    <changefreq>weekly</changefreq>
                    <priority>0.6</priority>
                </url>`;
        }

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                ${sitemapEntries}
            </urlset>`;

        return new NextResponse(sitemap.trim(), {
            status: 200,
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });

    } catch (error) {
        console.error('Error generating tractor combinations sitemap:', error);
        return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
            {
                status: 500,
                headers: { 'Content-Type': 'application/xml' },
            }
        );
    }
}
