require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
   const { data: user } = await supabase.from('users').select('*').limit(1).single();
   console.log("User keys:", Object.keys(user));
   const { data: listing } = await supabase.from('listings').select('*').limit(1).single();
   console.log("Listing keys:", Object.keys(listing));
}
check();
