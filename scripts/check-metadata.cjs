const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// We need pg connection to query pg_proc, but we can't easily connect without connection string.
// Wait, we can use the Supabase JS client to query the users table data to see the raw_user_meta_data.
// Since we have supabase service role key, we can query auth.users if we have access via JS.
// Supabase JS doesn't easily expose auth.users through regular select. But we can use admin API.

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMetadata() {
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
    if (users) {
        users.users.slice(0, 10).forEach(u => console.log(u.email, u.user_metadata));
    } else {
        console.error(error);
    }
}

checkMetadata();
