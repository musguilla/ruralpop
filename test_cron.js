require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data: listings, error } = await supabaseAdmin
        .from('listings')
        .select('id, title, status, title_pt, description_pt')
        .eq('status', 'active')
        .is('title_pt', null)
        .limit(5);
    
    console.log("Listings to translate:", listings?.length, error);
    if(listings) console.log(listings);
}
check();
