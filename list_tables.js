const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);
async function run() {
  const { data, error } = await supabase.rpc('get_tables'); // Or try selecting from pg_tables if possible
  // Since we might not have rpc, let's just query some guessed names:
  const tablesToGuess = ['ghost_companies', 'professional_profiles', 'companies', 'marketing_campaigns', 'ghosts'];
  for (const t of tablesToGuess) {
     const res = await supabase.from(t).select('id').limit(1);
     console.log(t, res.error ? res.error.message : 'EXISTS!');
  }
}
run();
