const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase.from('listings').select('equipop_subcategory').not('equipop_subcategory', 'is', null);
    if (error) { console.log(error); return; }
    
    const subs = [...new Set(data.map(d => d.equipop_subcategory))];
    console.log("Distinct subcategories in DB:");
    console.log(subs);
}

check();
