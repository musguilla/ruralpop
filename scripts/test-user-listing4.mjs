import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: listings, error } = await supabase
        .from('listings')
        .select('id, title, description, status, user_id')
        .or(`description.ilike.%mdiazalvarez85@gmail.com%,contact_email.eq.mdiazalvarez85@gmail.com`);
        
    console.log(`Found ${listings ? listings.length : 0} matching listings by description/contact_email:`);
    console.log(listings);
}
check();
