const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function check() {
    const { data: user, error: userError } = await supabase.from('users').select('*').eq('email', 'pelloarrospide1@gmail.com').single();
    console.log("User contact_phone:", user.contact_phone);
}
check();
