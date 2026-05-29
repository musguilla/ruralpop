import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    // Search active listings containing "tractor"
    const { data: listings, error: listingError } = await supabase
        .from('listings')
        .select(`
            id, 
            title, 
            status, 
            user_id,
            users!inner (id, name, email)
        `)
        .eq('status', 'active');
        
    if (listingError) {
        console.error("Listing error:", listingError);
        return;
    }
    
    // Filter by users named Mario or similar
    const marioListings = listings.filter(l => 
        l.users?.email?.toLowerCase().includes('mdiaz') ||
        l.users?.email?.toLowerCase().includes('mario')
    );
    
    console.log(`Found ${marioListings.length} matching active listings for mdiaz/mario:`);
    console.log(JSON.stringify(marioListings, null, 2));
}
check();
