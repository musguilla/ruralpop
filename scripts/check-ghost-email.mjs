import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: listings } = await supabase.from('listings').select('id, title, status, email, phone').ilike('email', '%ortiztorre%');
    console.log("Listings with email containing ortiztorre:", listings);
    
    // Some listings might store user email if they are ghost listings, but Ruralpop `listings` table might not have an `email` column
}
check();
