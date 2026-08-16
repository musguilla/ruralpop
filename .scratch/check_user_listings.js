require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const userIds = [
    '79857f78-e3a4-4760-8c7c-63f529563e89',
    '4592afdb-eb3f-44c7-8879-3d033458f820',
    '4147e6be-9b63-4718-934d-cc6abf95c4e2'
  ];
  
  const { data, error } = await supabase.from('listings')
    .select('user_id, title, created_at, tags')
    .in('user_id', userIds)
    .order('created_at', { ascending: false });
    
  console.log("Listings:", data);
}

check();
