require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.rpc('get_tables'); // Or try querying information_schema if possible via postgrest?
  // Let's just query a known table that might track things. Do we have a payments or transactions table?
  const { data: cols, error: err2 } = await supabase.from('users').select('nif, zoo_register_number').neq('nif', null).limit(10);
  console.log("Users with NIF:", cols);
}

check();
