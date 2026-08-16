require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function alterTables() {
  console.log("Adding pt columns...");
  // We can't run ALTER TABLE through standard supabase-js unless we use rpc.
  // Instead of risking RPC lack of privileges, let's check if there is a 'run_sql' or 'exec_sql' RPC.
  let { data, error } = await supabase.rpc('run_sql', { query: "ALTER TABLE listings ADD COLUMN IF NOT EXISTS title_pt text; ALTER TABLE listings ADD COLUMN IF NOT EXISTS description_pt text; ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_pt text; ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS name_pt text;" });
  console.log("RPC run_sql result:", data, error);
}

alterTables();
