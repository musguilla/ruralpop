require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    console.log("=== Checking listings for Ote Marinas (ef194702-30dc-418a-9360-c5da7baba87d) ===");
    const { data: oteListings } = await supabase
        .from('listings')
        .select('id, title, status, is_featured, featured_until, created_at')
        .eq('user_id', 'ef194702-30dc-418a-9360-c5da7baba87d');
    console.log("Ote Listings:", oteListings);

    console.log("\n=== Checking listings for Irene Alonso (cacbfea3-472e-415b-b6e2-c1683b9c9d39) ===");
    const { data: ireneListings } = await supabase
        .from('listings')
        .select('id, title, status, is_featured, featured_until, created_at')
        .eq('user_id', 'cacbfea3-472e-415b-b6e2-c1683b9c9d39');
    console.log("Irene Listings:", ireneListings);
}

main();
