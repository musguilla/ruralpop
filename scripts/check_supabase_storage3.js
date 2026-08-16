require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);

    const { data: listings } = await supabaseAdmin.rpc('get_listings_with_supabase_images_or_something');
    // RPC might not exist. Let's just fetch recent active ones and manually inspect if any have supabase URLs.
    
    const { data } = await supabaseAdmin
        .from('listings')
        .select('id, image_urls')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1000);
        
    let count = 0;
    if (data) {
        for (const l of data) {
            if (l.image_urls && l.image_urls.some(u => u.includes('supabase.co'))) {
                count++;
            }
        }
    }
    console.log("Out of latest 1000 active listings, how many have supabase URLs?", count);
}

main();
