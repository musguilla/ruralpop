require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: listings } = await supabase
        .from('listings')
        .select('id, title, is_featured, featured_until')
        .eq('user_id', 'b3fb19a4-adf2-43e0-af99-d8383b94386f');

    console.log("=== Verified Jorge Listings ===");
    console.log(JSON.stringify(listings, null, 2));
}

main();
