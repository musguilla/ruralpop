const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// using REST API to query a table, but we don't have access to information_schema directly via postgrest.
// we can do this instead: fetch the openapi spec!
async function run() {
  const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${serviceRoleKey}`);
  const spec = await res.json();
  console.log(Object.keys(spec.paths).filter(p => !p.includes('{') && p !== '/').map(p => p.substring(1)));
}
run();
