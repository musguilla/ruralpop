require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabaseAdmin = createClient(url, secretKey);

    const { data: featuredListings, error } = await supabaseAdmin
        .from('listings')
        .select('id, title, user_id, is_featured, created_at')
        .eq('is_featured', true)
        .order('created_at', { ascending: false });

    console.log("Featured listings count:", featuredListings?.length);
    console.log(JSON.stringify(featuredListings, null, 2));

    // Find the listing for "vacas paridas" or "2 vacas"
    const { data: vacasListing } = await supabaseAdmin
        .from('listings')
        .select('id, title, is_featured, created_at')
        .ilike('title', '%vacas%paridas%')
        .limit(5);

    console.log("Vacas paridas listings found:", vacasListing);
}

main();
