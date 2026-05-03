import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("🔍 Buscando anuncios con URLs antiguas r2.dev...");
    let start = 0;
    const limit = 1000;
    let totalUpdated = 0;

    while (true) {
        const { data: listings, error } = await supabase
            .from('listings')
            .select('id, image_urls')
            .range(start, start + limit - 1);

        if (error) {
            console.error("❌ Error fetching:", error);
            break;
        }

        if (listings.length === 0) break;

        for (const listing of listings) {
            if (!listing.image_urls) continue;
            
            let needsUpdate = false;
            let newUrls = [...listing.image_urls];

            for (let i = 0; i < newUrls.length; i++) {
                if (typeof newUrls[i] === 'string' && newUrls[i].includes('pub-d5e9ba1c275e41eb8458dc0c7fe5f525.r2.dev')) {
                    newUrls[i] = newUrls[i].replace('https://pub-d5e9ba1c275e41eb8458dc0c7fe5f525.r2.dev', 'https://media.ruralpop.com');
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                const { error: updateError } = await supabase
                    .from('listings')
                    .update({ image_urls: newUrls })
                    .eq('id', listing.id);
                
                if (updateError) {
                    console.error(`❌ Error actualizando ${listing.id}:`, updateError);
                } else {
                    console.log(`✅ Anuncio actualizado: ${listing.id}`);
                    totalUpdated++;
                }
            }
        }
        start += limit;
    }
    console.log(`🎉 FIN. Se actualizaron las URLs de ${totalUpdated} anuncios en la base de datos.`);
}

run();
