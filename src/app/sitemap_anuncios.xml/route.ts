import { createClient } from '@/utils/supabase/server';
import { encodeId } from '@/utils/idUtils';
import { slugify } from '@/utils/seoUtils';

export const revalidate = 86400; // 24 horas

export async function GET() {
    const supabase = await createClient();
    const { data: listings } = await supabase.from('listings').select('id, title, updated_at').eq('status', 'active');

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ruralpop.com';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    if (listings && listings.length > 0) {
        listings.forEach((listing: any) => {
            const shortId = encodeId(listing.id);
            const titleSlug = slugify(listing.title);
            const url = `${baseUrl}/anuncio/${titleSlug}-${shortId}`;
            const lastMod = listing.updated_at ? new Date(listing.updated_at).toISOString() : new Date().toISOString();

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
