require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data: user } = await supabase.from('users').select('*').eq('email', 'mojotonio@hotmail.com').single();
    
    // update Rosellas to active just in case
    await supabase.from('listings').update({ status: 'active' }).eq('id', '46c3a4d8-512a-42b6-a8e6-83b3a3568809');

    const { data: listings } = await supabase.from('listings').select('id, title, status, tags').eq('user_id', user.id);
    console.log("Updated listings:");
    listings.forEach(l => {
        console.log(`- ${l.title} (ID: ${l.id}) | Status: ${l.status} | Tags:`, l.tags);
    });
}
check();
