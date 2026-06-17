require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// USE ANON KEY THIS TIME
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('tractor_feature_pages').select('slug').eq('slug', 'pastos');
  console.log("Data:", data, "Error:", error);
}
run();
