require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://zrpucbuvojskcwrhwevv.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.rpc('get_column_info', { table_name: 'users', column_name: 'zoo_register_number' });
  console.log("Error:", error);
  console.log("Data:", data);
}
check();
