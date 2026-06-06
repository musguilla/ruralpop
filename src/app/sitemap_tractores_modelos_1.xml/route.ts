import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ruralpop.com';
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
        let allModels: any[] = [];
        let from = 0;
        const limit = 1000;

        while (true) {
            const { data: models, error: modelsError } = await supabase
                .from('tractor_models')
                .select('slug, updated_at, brand:tractor_brands!inner(slug)')
                .eq('is_active', true)
                .range(from, from + limit - 1);

            if (modelsError || !models || models.length === 0) break;
            
            allModels = allModels.concat(models);
            
            if (models.length < limit) break;
            from += limit;
        }

        for (const m of allModels) {
            const model = m as any;
            if (model.brand && !Array.isArray(model.brand)) {
                xml += `  <url>\n`;
                xml += `    <loc>${baseUrl}/tractores/${model.brand.slug}/${model.slug}</loc>\n`;
                xml += `    <lastmod>${new Date(model.updated_at || new Date()).toISOString()}</lastmod>\n`;
                xml += `    <changefreq>weekly</changefreq>\n`;
                xml += `    <priority>0.7</priority>\n`;
                xml += `  </url>\n`;
            }
        }
    } catch (err) {
        console.error("Sitemap Tractores Modelos: Error fetching data", err);
    }

    xml += `</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
    });
}
