const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkListings() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .or('tenant_id.eq.69d55371-2f70-4e67-b55c-4502bce305bb');

    console.log("Total Items:", data ? data.length : 0);
    if (data) {
        data.forEach(item => {
            console.log(`- Title: "${item.title}"`);
            console.log(`  Category: ${item.category}, Subcategory: ${item.subcategory}`);
            console.log(`  ID: ${item.id}`);
            console.log(`  Tenant: ${item.tenant_id}`);
        });
    }
}

checkListings();
