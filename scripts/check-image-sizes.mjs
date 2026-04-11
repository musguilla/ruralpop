import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImageSizes() {
    console.log("Fetcheando últimos 20 anuncios...");
    const { data: listings, error } = await supabase
        .from('listings')
        .select('id, title, created_at, image_urls')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error fetching listings:", error);
        return;
    }

    console.log(`Encontrados ${listings.length} anuncios. Analizando tamaños de imágenes...`);
    
    let totalImagesProcessed = 0;
    
    for (const listing of listings) {
        if (!listing.image_urls || listing.image_urls.length === 0) continue;
        
        console.log(`\nAnuncio: "${listing.title}" (Creado: ${new Date(listing.created_at).toLocaleString()})`);
        
        for (const url of listing.image_urls) {
            try {
                // Ignore empty URLs
                if (!url) continue;

                // Make a HEAD request to get Content-Length
                const response = await fetch(url, { method: 'HEAD' });
                const contentLength = response.headers.get('content-length');
                const contentType = response.headers.get('content-type');
                
                if (contentLength) {
                    const sizeKB = (parseInt(contentLength) / 1024).toFixed(2);
                    let colorCode = '\x1b[32m'; // green for < 500KB
                    if (parseInt(contentLength) > 1024 * 1024) colorCode = '\x1b[31m'; // red > 1MB
                    else if (parseInt(contentLength) > 1024 * 500) colorCode = '\x1b[33m'; // yellow > 500KB
                    
                    console.log(`  - [${contentType}] Tamaño: ${colorCode}${sizeKB} KB\x1b[0m | URL: ${url.split('/').pop()}`);
                } else {
                    console.log(`  - [${contentType}] Tamaño: Desconocido | URL: ${url.split('/').pop()}`);
                }
                totalImagesProcessed++;
            } catch (err) {
                console.error(`  - No se pudo comprobar ${url}`);
            }
        }
    }
    
    console.log(`\nAnálisis completado. Imágenes verificadas: ${totalImagesProcessed}`);
}

checkImageSizes();
