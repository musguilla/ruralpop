import { createClient } from '@/utils/supabase/server';
import { slugify } from '@/lib/utils/slugify';

export const dynamic = 'force-dynamic';

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ruralpop.com';
    const supabase = await createClient();

    // 1. Fetch active markets
    const { data: markets } = await supabase
        .from('market_sources')
        .select('id, name, updated_at')
        .eq('active', true);

    const sitemapEntries: any[] = [];

    // Base market hub page
    sitemapEntries.push({
        url: `${baseUrl}/precios-ganado/vacuno`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
    });

    if (markets && markets.length > 0) {
        for (const market of markets) {
            const marketSlug = slugify(market.name);
            
            // Market detail page
            sitemapEntries.push({
                url: `${baseUrl}/precios-ganado/vacuno/mercados/${marketSlug}`,
                lastModified: new Date(market.updated_at || new Date()),
                changeFrequency: 'daily',
                priority: 0.8,
            });

            // Fetch distinct categories for this market to generate historical pages
            let from = 0;
            const limit = 1000;
            const categoryMap = new Map();

            while (true) {
                const { data: prices, error } = await supabase
                    .from('livestock_prices')
                    .select('category_name, date')
                    .eq('market_source_id', market.id)
                    .order('date', { ascending: false })
                    .range(from, from + limit - 1);

                if (error || !prices || prices.length === 0) break;

                for (const price of prices) {
                    if (!categoryMap.has(price.category_name)) {
                        categoryMap.set(price.category_name, price.date);
                    }
                }

                if (prices.length < limit) break;
                from += limit;
            }

            categoryMap.forEach((latestDate, categoryName) => {
                const categorySlug = slugify(categoryName);
                sitemapEntries.push({
                    url: `${baseUrl}/precios-ganado/vacuno/mercados/${marketSlug}/${categorySlug}`,
                    lastModified: new Date(latestDate),
                    changeFrequency: 'weekly',
                    priority: 0.7,
                });
            });
        }
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    sitemapEntries.forEach(entry => {
        xml += `  <url>\n`;
        xml += `    <loc>${entry.url}</loc>\n`;
        xml += `    <lastmod>${entry.lastModified.toISOString()}</lastmod>\n`;
        xml += `    <changefreq>${entry.changeFrequency}</changefreq>\n`;
        xml += `    <priority>${entry.priority}</priority>\n`;
        xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            // Allow Edge caching
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
    });
}
