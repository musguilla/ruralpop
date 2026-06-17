require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://zrpucbuvojskcwrhwevv.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('listings').select('tags').not('tags', 'is', null).limit(1);
  if (error) console.log("Error:", error);
  else console.log("Tags:", data[0]?.tags, "Type:", typeof data[0]?.tags);
}
run();
