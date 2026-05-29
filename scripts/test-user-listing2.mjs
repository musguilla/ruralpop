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
            users (id, name, email)
        `)
        .ilike('title', '%tractor%')
        .eq('status', 'active');
        
    if (listingError) {
        console.error("Listing error:", listingError);
        return;
    }
    
    // Filter by users named Mario or similar
    const marioListings = listings.filter(l => 
        l.users?.name?.toLowerCase().includes('mario') ||
        l.users?.email?.toLowerCase().includes('diaz') ||
        l.users?.email?.toLowerCase().includes('alvarez') ||
        l.users?.email?.toLowerCase().includes('mdiaz')
    );
    
    console.log(`Found ${marioListings.length} matching tractor listings for mario/diaz/alvarez:`);
    console.log(JSON.stringify(marioListings, null, 2));
}
check();
