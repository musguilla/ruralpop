import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: favs, error: favError } = await supabase
        .from('favorites')
        .select('listing_id')
        .limit(10000); // get all to count properly
        
    if (!favError && favs) {
        const counts = {};
        for (const f of favs) {
            counts[f.listing_id] = (counts[f.listing_id] || 0) + 1;
        }
        const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 10);
        
        const topIds = sorted.map(s => s[0]);
        
        const { data: listings } = await supabase
            .from('listings')
            .select('id, title, price, status')
            .in('id', topIds);
            
        // Map titles to the counts
        const results = sorted.map(([id, count]) => {
            const l = listings?.find(listing => listing.id === id);
            return {
                title: l?.title,
                price: l?.price,
                status: l?.status,
                likes: count
            };
        });
        
        console.log("Top 10 listings by likes:");
        console.log(results);
    }
}
check();
