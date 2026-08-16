require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);

    console.log("=== Finding PELIBUEY listing ===");

    const { data: listings, error } = await supabaseAdmin
        .from('listings')
        .select('id, title, price, is_featured, featured_until, created_at, status, location')
        .ilike('title', '%PELIBUEY%');

    if (error) {
        console.error("Error searching listings:", error);
        return;
    }

    console.log("Matching listings found:", listings?.length);
    console.log(JSON.stringify(listings, null, 2));
}

main();
