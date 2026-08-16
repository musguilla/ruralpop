require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkListings() {
  console.log("Checking listings with welfare_validated tag...");
  const { data, error } = await supabase
    .from('listings')
    .select('id, title, user_id, status, created_at, tags')
    .contains('tags', ['welfare_validated'])
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching listings:", error);
  } else {
    console.log(JSON.stringify(data, null, 2));
    
    if (data && data.length > 0) {
      const { data: user } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', data[0].user_id)
        .single();
      console.log("User details for latest listing:", user);
    }
  }
}

checkListings();
