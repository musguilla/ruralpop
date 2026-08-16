require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: oteListings } = await supabase
        .from('listings')
        .select('id, title, is_featured, featured_until')
        .eq('user_id', 'ef194702-30dc-418a-9360-c5da7baba87d')
        .eq('status', 'active');

    console.log("Ote Listings after update:", JSON.stringify(oteListings, null, 2));
}

main();
