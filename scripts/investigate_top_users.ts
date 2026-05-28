import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    console.log("Fetching top users by listings...");
    
    // Obtenemos todos los listings agrupados por user_id
    const { data: listings, error } = await supabase
        .from('listings')
        .select('user_id');
        
    if (error) {
        console.error("Error fetching listings:", error);
        return;
    }
    
    const counts: Record<string, number> = {};
    for (const l of listings) {
        counts[l.user_id] = (counts[l.user_id] || 0) + 1;
    }
    
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    
    console.log("Top users (raw ID and count):");
    console.log(sorted);
    
    console.log("\nFetching their profiles...");
    for (const [userId, count] of sorted) {
        const { data: profile } = await supabase
            .from('users_public_profile')
            .select('*')
            .eq('id', userId)
            .single();
            
        console.log(`User ID: ${userId} | Anuncios: ${count}`);
        console.log(`Profile: ${profile ? JSON.stringify(profile) : 'NO PROFILE'}`);
        console.log("---");
    }
}
run();
