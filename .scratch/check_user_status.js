require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('listings')
    .select('user_id, title, status, created_at, tags')
    .eq('user_id', '79857f78-e3a4-4760-8c7c-63f529563e89')
    .order('created_at', { ascending: false });
    
  console.log("Listings:", data);
}

check();
