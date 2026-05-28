const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);
async function run() {
  const { data, error } = await supabase.from('users').update({ is_ghost: true }).not('ghost_token', 'is', null);
  console.log(JSON.stringify({ error, data }));
}
run();
