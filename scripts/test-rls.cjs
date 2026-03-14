const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLS() {
    // Attempt to log in with the user's email if possible, or just look at policies.
    const { data: policies, error } = await supabase
        .rpc('get_policies', { table_name: 'messages' }) // This probably doesn't exist.

    console.log("We cannot easily query policies via REST Anon. But let's check what service role can do.");
    const admin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // fetch a message that is false
    const { data: msgs } = await admin.from('messages').select('*').eq('is_read', false).limit(1);
    console.log("Unread msgs:", msgs);

    if (msgs && msgs.length > 0) {
        console.log("Will try to update it as anon. It should fail and we will see the error.");
        const { data, error: updateErr } = await supabase.from('messages').update({ is_read: true }).eq('id', msgs[0].id);
        console.log("Update err:", updateErr);
    }
}
testRLS();
