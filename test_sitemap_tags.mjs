import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const LOCATIONS = [
    { id: 1, name: "Asturias" },
    { id: 2, name: "Cantabria" }
]; // Mock for testing

async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ruralpop.com';

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.log("NO ENV VARS");
        return;
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: listings, error } = await supabase
        .from('listings')
        .select('tags, province_id')
        .eq('status', 'active');

    if (error || !listings) {
        console.error("Error fetching tags for sitemap:", error);
        return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
    }

    const uniqueUrls = new Set();

    const normalizeUrlString = (str) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    for (const listing of listings) {
        if (listing.tags && Array.isArray(listing.tags) && listing.tags.length > 0 && listing.province_id) {
            const prov = { name: "ProvinciaTest" }; // Mocked
            if (prov) {
                const provSlug = normalizeUrlString(prov.name);
                for (const tag of listing.tags) {
                    const tagSlug = normalizeUrlString(tag);
                    const url = `${baseUrl}/${tagSlug}-${provSlug}`;
                    uniqueUrls.add(url);
                }
            }
        }
    }

    const xmlUrls = Array.from(uniqueUrls).map(url => `
        <url>
            <loc>${url}</loc>
            <changefreq>daily</changefreq>
            <priority>0.8</priority>
        </url>
    `).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlUrls}\n</urlset>`.trim();
    
    console.log(xml);
}

GET();
