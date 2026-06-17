require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://zrpucbuvojskcwrhwevv.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { error } = await supabase.rpc('run_sql', { sql: `
    ALTER TABLE listings ADD COLUMN IF NOT EXISTS milestone_10_sent BOOLEAN DEFAULT FALSE;
    ALTER TABLE listings ADD COLUMN IF NOT EXISTS milestone_20_sent BOOLEAN DEFAULT FALSE;
  `});
  if (error) console.log("RPC Error:", error);
  else console.log("Added columns successfully.");
}
run();
