require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase
        .from('tractor_feature_pages')
        .select('*')
        .eq('feature_type', 'crop')
        .eq('slug', 'pastos')
        .single();
  console.log("Data:", !!data, "Error:", error);
}
run();
