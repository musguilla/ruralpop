require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    console.log("=== Testing Admin Queries with ANON KEY ===");
    const client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { count: usersCount, error: usersErr } = await client
        .from("users")
        .select("*", { count: 'exact', head: true });
        
    console.log("Users count:", usersCount, usersErr);

    const { count: listingsCount, error: listingsErr } = await client
        .from("listings")
        .select("*", { count: 'exact', head: true });
        
    console.log("Listings count:", listingsCount, listingsErr);
    
    const { data: listings, error: lErr } = await client
        .from("listings")
        .select("id, title, status, created_at")
        .limit(5);
        
    console.log("Listings sample:", listings?.length, lErr);
}

main();
