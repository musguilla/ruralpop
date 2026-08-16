require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function find() {
   const { data: listings } = await supabase.from('listings').select('id, title').ilike('title', '%anticocidico%');
   console.log("Listings:", listings);
}
find();
