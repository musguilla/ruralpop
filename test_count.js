const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function countListings() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { count, error } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('tenant_id', '69d55371-2f70-4e67-b55c-4502bce305bb');
        
    console.log('Equipop listings count:', count);
}

countListings();
