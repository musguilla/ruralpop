import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fetch from 'node-fetch';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: listings } = await supabase
        .from('listings')
        .select('id, title, image_urls')
        .order('created_at', { ascending: false })
        .limit(10);
        
    for (const listing of listings) {
        if (!listing.image_urls) continue;
        for (const url of listing.image_urls) {
            try {
                const res = await fetch(url, { method: 'HEAD' });
                const size = parseInt(res.headers.get('content-length') || '0', 10);
                if (size > 300 * 1024) {
                    console.log(`Found heavy image: ${size/1024} KB`);
                    console.log(`Listing ID: ${listing.id}`);
                    console.log(`Title: ${listing.title}`);
                    console.log(`URL: ${url}`);
                    return;
                }
            } catch (e) {
                // ignore
            }
        }
    }
    console.log("No heavy images found in recent 10 listings.");
}
run();
