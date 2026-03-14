const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsers() {
    // get latest users
    let { data, error } = await supabaseAdmin.from('users').select('*').order('created_at', { ascending: false }).limit(5);
    console.log("Recent users:", data);

    // Check if there is a function for handle_new_user
    let { data: fn, error: fnError } = await supabaseAdmin.rpc('get_trigger_def', {}); // might not exist
}

checkUsers();
