require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://zrpucbuvojskcwrhwevv.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('listings').select('*').limit(1);
  if (data && data.length > 0) {
      console.log("Columns:", Object.keys(data[0]));
  }
}
check();
