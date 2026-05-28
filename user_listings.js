const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);
async function run() {
  const { data, error } = await supabase.from('listings').select('id, title').eq('user_id', '8e0e1ad1-dfa7-446d-b4a2-b06c70c684f4');
  console.log(JSON.stringify({ error, count: data?.length, data }, null, 2));
}
run();
