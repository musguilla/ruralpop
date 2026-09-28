require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const email = 'oficinacunimar@gmail.com';
    
    const { error: updateError } = await supabase.from('users').update({
        company_website: 'https://cunimar.com'
    }).eq('email', email);
    
    if (updateError) {
        console.error("Error updating user:", updateError);
    } else {
        console.log(`Successfully added website to Cunimar profile.`);
    }
}
run();
