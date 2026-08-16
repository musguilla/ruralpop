require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
   const { data: user } = await supabase.from('users').select('id, email').eq('email', 'victorlopezsantander@gmail.com').single();
   if (!user) return console.log("User not found");
   
   console.log("User ID:", user.id);
   const { data: listings } = await supabase.from('listings').select('id, title, status, is_featured, featured_until, created_at').eq('user_id', user.id);
   console.log("Listings:", listings);
}
check();
