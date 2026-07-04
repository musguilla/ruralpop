const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase
        .from('listings')
        .select('equipop_category, equipop_subcategory')
        .eq('status', 'active')
        .not('equipop_category', 'is', null);
        
    console.log("Error:", error);
    const activeCats = [...new Set(data.map(d => d.equipop_category))];
    const activeSubcats = [...new Set(data.map(d => d.equipop_subcategory))].filter(Boolean);
    console.log("Active Categories:", activeCats);
    console.log("Active Subcats:", activeSubcats);
}

check();
