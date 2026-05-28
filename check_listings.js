const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function check() {
    const { data, error } = await supabase.from('listings').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(20);
    if (error) console.error(error);
    else console.log(data.map(d => `${d.id} - ${d.title} - ${d.status}`));
}
check();
