require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
    const { data } = await supabase.from("listings").select("subcategory");
    const counts = {};
    data.forEach(d => { counts[d.subcategory] = (counts[d.subcategory] || 0) + 1; });
    console.log(counts);
}
run();
