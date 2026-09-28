require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
    const { data: user, error } = await supabase.from('users').select('*').eq('email', 'oficinacunimar@gmail.com').single();
    if (error) console.error(error);
    console.log(user);
}
run();
