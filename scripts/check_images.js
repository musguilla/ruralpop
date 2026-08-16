require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);

    const ids = [
        "3f02ea75-b494-4960-8df7-62fdd537b397", // Potra
        "a8f78fc3-9cd5-4c47-bfbd-3e51e45243cd"  // Pelibuey
    ];

    const { data } = await supabaseAdmin
        .from('listings')
        .select('id, title, image_urls')
        .in('id', ids);

    console.log(JSON.stringify(data, null, 2));
}

main();
