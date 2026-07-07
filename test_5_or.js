const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    let supabaseQuery = supabase
        .from('listings')
        .select(`id, title, location`)
        .eq('status', 'active')
        .or('tenant_id.eq.69d55371-2f70-4e67-b55c-4502bce305bb');

    const term = 'Cabezada';
    supabaseQuery = supabaseQuery.or(`title.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%,category.ilike.%${term}%,subcategory.ilike.%${term}%`);
    
    const { data, error } = await supabaseQuery;
    console.log('Results:', data);
    console.log('Error:', error);
}

run();
