require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function check() {
    const { data: listings, error } = await supabaseAdmin
        .from('listings')
        .select('id, title, title_pt, description_pt')
        .not('title_pt', 'is', null)
        .limit(5);
    console.log("Translated listings:", listings?.length, error);
    if(listings) console.log(listings);
}
check();
