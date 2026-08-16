require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data: cols, error } = await supabaseAdmin.from('categories').select('*').limit(1);
    if(cols && cols.length > 0) console.log(Object.keys(cols[0]));
}
check();
