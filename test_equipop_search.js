const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testEquipopSearch() {
    let q = supabase.from('listings').select('id, title, tenant_id, shared_to_equipop').eq('status', 'active');
    
    // Equipop tenant filter
    q = q.or('tenant_id.eq.69d55371-2f70-4e67-b55c-4502bce305bb,shared_to_equipop.eq.true');
    
    // Search query with *
    const term = 'Cabezada';
    q = q.or(`title.ilike.*${term}*,description.ilike.*${term}*,location.ilike.*${term}*,category.ilike.*${term}*,subcategory.ilike.*${term}*`);
    
    const { data, error } = await q;
    console.log('Results with *:', data ? data.length : 0);
    console.log(data);
    
    let q2 = supabase.from('listings').select('id, title, tenant_id, shared_to_equipop').eq('status', 'active');
    q2 = q2.or('tenant_id.eq.69d55371-2f70-4e67-b55c-4502bce305bb,shared_to_equipop.eq.true');
    q2 = q2.or(`title.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%,category.ilike.%${term}%,subcategory.ilike.%${term}%`);
    const res2 = await q2;
    console.log('Results with %:', res2.data ? res2.data.length : 0);
}

testEquipopSearch();
