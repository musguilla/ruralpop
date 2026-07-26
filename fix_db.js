require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fix() {
    const { data: listings, error } = await supabaseAdmin
        .from('listings')
        .select('id, title, title_pt')
        .not('title_pt', 'is', null);
    
    if (error) {
        console.error("Error fetching", error);
        return;
    }

    let count = 0;
    for (const l of listings) {
        if (l.title === l.title_pt) {
            console.log("Fixing", l.id);
            await supabaseAdmin.from('listings').update({ title_pt: null, description_pt: null }).eq('id', l.id);
            count++;
        }
    }
    console.log("Fixed", count, "listings.");
}
fix();
