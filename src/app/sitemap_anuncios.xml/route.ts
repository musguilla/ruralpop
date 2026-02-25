import { createClient } from '@supabase/supabase-js';
import { encodeId } from '@/utils/idUtils';
import { slugify } from '@/utils/seoUtils';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
    // Instanciamos Supabase directamente para la Caché Estática sin involucrar cookies de usuario
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const { data: listings, error } = await supabase.from('listings').select('id, title, created_at').eq('status', 'active');

    if (error) {
        xml += `  <!-- Error fetching: ${error.message} -->\n`;
        xml += `  <!-- Url: ${supabaseUrl ? 'Present' : 'Missing'}, Key: ${supabaseKey ? 'Present' : 'Missing'} -->\n`;
    } else if (!listings || listings.length === 0) {
        xml += `  <!-- No listings found -->\n`;
        xml += `  <!-- Url: ${supabaseUrl ? 'Present' : 'Missing'}, Key: ${supabaseKey ? 'Present' : 'Missing'} -->\n`;
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ruralpop.com';

    if (listings && listings.length > 0) {
        listings.forEach((listing: any) => {
            const shortId = encodeId(listing.id);
            const titleSlug = slugify(listing.title);
            const url = `${baseUrl}/anuncio/${titleSlug}-${shortId}`;
            const lastMod = listing.created_at ? new Date(listing.created_at).toISOString() : new Date().toISOString();

            xml += `  <url>\n`;
            xml += `    <loc>${url}</loc>\n`;
            xml += `    <lastmod>${lastMod}</lastmod>\n`;
            xml += `    <changefreq>daily</changefreq>\n`;
            xml += `    <priority>0.7</priority>\n`;
            xml += `  </url>\n`;
        });
    }

    xml += `</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
