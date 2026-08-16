require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('listings')
    .select('title, status, created_at, tags')
    .eq('id', 'eaef7dbe-8adb-4911-a8ba-8dac32082228')
    .single();
    
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Listing details:", data);
  }
}

check();
