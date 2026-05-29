import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    // 1. Get user by email
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'mdiazalvarez85@gmail.com');
        
    if (userError) {
        console.error("User error:", userError);
        return;
    }
    
    if (!users || users.length === 0) {
        console.log("No user found with email mdiazalvarez85@gmail.com");
        return;
    }
    
    const user = users[0];
    console.log("User found:", user.id, user.name);
    
    // 2. Get ALL listings for this user
    const { data: listings, error: listingError } = await supabase
        .from('listings')
        .select('id, title, status, category')
        .eq('user_id', user.id);
        
    if (listingError) {
        console.error("Listing error:", listingError);
        return;
    }
    
    console.log(`Found ${listings ? listings.length : 0} total listings for this user:`);
    console.log(listings);
}
check();
