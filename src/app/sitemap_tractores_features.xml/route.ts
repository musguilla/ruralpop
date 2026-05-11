import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic SSR
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Must use service role if reading hidden parts or bypassing RLS just in case, but anon is fine for public

        // Initialize Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);

        const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ruralpop.com';

        let sitemapEntries = '';

        // Only fetch indexable features
        const { data: features, error } = await supabase
            .from('tractor_feature_pages')
            .select('url_path, updated_at, last_generated_at')
            .eq('indexable', true);

        if (!error && features) {
            for (const feature of features) {
                const date = feature.last_generated_at || feature.updated_at || new Date().toISOString();
                sitemapEntries += `
                    <url>
                        <loc>${SITE_URL}${feature.url_path}</loc>
                        <lastmod>${new Date(date).toISOString()}</lastmod>
                        <changefreq>weekly</changefreq>
                        <priority>0.65</priority>
                    </url>`;
            }
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
        console.error('Error generating tractor features sitemap:', error);
        return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
            {
                status: 500,
                headers: { 'Content-Type': 'application/xml' },
            }
        );
    }
}
