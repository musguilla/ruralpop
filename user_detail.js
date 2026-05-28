const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);
async function run() {
  const { data, error } = await supabase.from('users').select('*').eq('email', 'maquinariaagrcolaplumedsl_ghost@ruralpop.com');
  console.log(JSON.stringify({ error, data }, null, 2));
}
run();
