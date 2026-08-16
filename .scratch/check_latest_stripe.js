require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkListings() {
  console.log("Checking recently updated listings or users...");
  const { data, error } = await supabase
    .from('listings')
    .select('id, title, user_id, status, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching listings:", error);
  } else {
    console.log("Latest listings:", data);
  }
}

checkListings();
