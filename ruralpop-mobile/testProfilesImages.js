require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
    const { data: listings, error } = await supabase.from('listings').select('id, user_id, images, status').limit(5);
    console.log("Error:", error);
    console.log("Listings:", JSON.stringify(listings, null, 2));
}
run();
