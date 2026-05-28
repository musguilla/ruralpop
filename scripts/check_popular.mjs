import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data: allFavorites } = await supabaseAdmin.from("favorites").select("listing_id");
    
    const counts = {};
    allFavorites.forEach(f => {
        counts[f.listing_id] = (counts[f.listing_id] || 0) + 1;
    });

    const topIds = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 15);
    console.log("Top IDs by likes in DB:", topIds);

    const { data: listings } = await supabaseAdmin.from("listings").select("id, title, status, users(is_ghost), image_urls").in("id", topIds.map(t => t[0]));
    
    console.log("\nListing details for top likes:");
    topIds.forEach(([id, count]) => {
        const listing = listings.find(l => l.id === id);
        if (listing) {
            console.log(`- ${listing.title} (${count} likes) [Status: ${listing.status}, Ghost: ${listing.users?.is_ghost}, Images: ${listing.image_urls.length}]`);
        } else {
            console.log(`- ID ${id} (${count} likes) NOT FOUND IN LISTINGS`);
        }
    });
}
check();
