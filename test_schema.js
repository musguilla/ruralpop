require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://zrpucbuvojskcwrhwevv.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('users').select('zoo_register_number').limit(1);
  console.log("Error:", error);
  // Actually, we can check the schema by creating a small text that is longer than what might be the limit.
  // Let's just try to update the user with a string of 14 characters to see if it fails.
  const { error: updateError } = await supabase.from('users').update({ zoo_register_number: 'ES390740001151' }).eq('id', '79857f78-e3a4-4760-8c7c-63f529563e89');
  console.log("Update Error:", updateError);
}
check();
