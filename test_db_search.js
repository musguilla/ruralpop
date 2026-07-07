const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkSearch() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('tenant_id', 'equipop')
        .eq('category', 'sillas-de-montar-y-accesorios')
        .eq('subcategory', 'Sillas de salto')
        .eq('status', 'active');
        
    console.log("Error:", error);
    console.log("Found records:", data?.length);
    if (data && data.length > 0) {
        console.log("First record subcategory:", data[0].subcategory);
    }
}
checkSearch();
