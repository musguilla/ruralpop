require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: listings, error } = await supabase
        .from('listings')
        .select('id, title, is_featured, featured_until, status, tenant_id')
        .eq('user_id', 'b3fb19a4-adf2-43e0-af99-d8383b94386f');

    console.log("Error:", error);
    console.log("Listings:", JSON.stringify(listings, null, 2));
}

main();
