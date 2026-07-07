const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkListing() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data, error } = await supabase
        .from('listings')
        .select('*')
        .ilike('title', '%Sudadero y Orejeras%');
    
    if (error) console.error(error);
    console.log(JSON.stringify(data, null, 2));
}

checkListing();
