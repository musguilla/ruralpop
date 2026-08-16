require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);
    
    const { data } = await supabaseAdmin
        .from('listings')
        .select('id, title, image_urls, is_featured')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1000);
        
    if (data) {
        for (const l of data) {
            if (l.image_urls && l.image_urls.some(u => u.includes('supabase.co'))) {
                console.log("Listing:", l);
            }
        }
    }
}

main();
