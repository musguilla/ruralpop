require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://zrpucbuvojskcwrhwevv.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: user } = await supabase.from('users').select('nif, contact_phone, name, email').eq('id', '79857f78-e3a4-4760-8c7c-63f529563e89').single();
  console.log("User Data:", user);
}
check();
