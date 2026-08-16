require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);

    console.log("=== 1. Finding 'POTRA DE AÑO' and 'CARNERO PELIBUEY PURO' ===");

    const { data: listings, error } = await supabaseAdmin
        .from('listings')
        .select('id, title, price, is_featured, featured_until, created_at, status, location')
        .or('title.ilike.%POTRA DE AÑO%,title.ilike.%CARNERO PELIBUEY PURO%');

    if (error) {
        console.error("Error searching listings:", error);
        return;
    }

    console.log("Matching listings found:", listings?.length);
    console.log(JSON.stringify(listings, null, 2));
}

main();
