import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("🔍 Analizando las rutas exactas en la base de datos...");
    let start = 0;
    const limit = 1000;
    
    let countR2Storage = 0;
    let countR2Listings = 0;
    let countSupabase = 0;

    while (true) {
        const { data: listings, error } = await supabase
            .from('listings')
            .select('id, image_urls')
            .range(start, start + limit - 1);

        if (error) break;
        if (listings.length === 0) break;

        for (const listing of listings) {
            if (!listing.image_urls) continue;
            for (let url of listing.image_urls) {
                if (typeof url === 'string') {
                    if (url.includes('media.ruralpop.com/storage')) countR2Storage++;
                    else if (url.includes('media.ruralpop.com/listings')) countR2Listings++;
                    else if (url.includes('supabase.co/storage')) countSupabase++;
                } else if (url && url.public_url) {
                    if (url.public_url.includes('media.ruralpop.com/storage')) countR2Storage++;
                    else if (url.public_url.includes('media.ruralpop.com/listings')) countR2Listings++;
                    else if (url.public_url.includes('supabase.co/storage')) countSupabase++;
                }
            }
        }
        start += limit;
    }
    
    console.log(`📊 URLs que apuntan a media.ruralpop.com/storage/... : ${countR2Storage}`);
    console.log(`📊 URLs que apuntan a media.ruralpop.com/listings/... : ${countR2Listings}`);
    console.log(`📊 URLs que apuntan a supabase.co/storage/... : ${countSupabase}`);
}

run();
