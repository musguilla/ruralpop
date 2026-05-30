import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: listings, error } = await supabase
        .from('listings')
        .select('id, title, favorites_count, status')
        .eq('status', 'active')
        .order('favorites_count', { ascending: false })
        .limit(10);
        
    if (error) {
        console.error("Error fetching listings:", error);
        
        // If favorites_count doesn't exist, we must count from favorites table
        const { data: favs, error: favError } = await supabase
            .from('favorites')
            .select('listing_id')
            .limit(1000);
            
        if (!favError && favs) {
            const counts = {};
            for (const f of favs) {
                counts[f.listing_id] = (counts[f.listing_id] || 0) + 1;
            }
            const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 10);
            console.log("Top favorited listing IDs:", sorted);
        }
    } else {
        console.log("Top favorited listings by favorites_count:");
        console.log(listings);
    }
}
check();
