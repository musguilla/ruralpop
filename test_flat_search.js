const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function searchFlat() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    let q = supabase.from('listings').select('title').eq('status', 'active');
    q = q.or('tenant_id.eq.69d55371-2f70-4e67-b55c-4502bce305bb');
    
    const terms = ['Cabezada', 'Muserola'];
    const orConditions = [];
    terms.forEach(term => {
        orConditions.push(`title.ilike.%${term}%`);
        orConditions.push(`description.ilike.%${term}%`);
        orConditions.push(`location.ilike.%${term}%`);
        orConditions.push(`category.ilike.%${term}%`);
        orConditions.push(`subcategory.ilike.%${term}%`);
    });
    
    q = q.or(orConditions.join(','));
    
    const { data, error } = await q;
    console.log('Results with flat OR:');
    console.log(data);
    if (error) console.error(error);
}

searchFlat();
