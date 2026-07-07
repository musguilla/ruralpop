const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSearch() {
    const EQUIPOP_ID = '69d55371-2f70-4e67-b55c-4502bce305bb';
    const tenantFilter = `tenant_id.eq.${EQUIPOP_ID}`; // Mobile app logic for Equipop

    let query = supabase.from('listings').select('title, tenant_id, shared_to_equipop').eq('status', 'active').or(tenantFilter);

    // Add search terms
    const term = 'Cabezada'; // Uppercase!
    query = query.or(`title.ilike.*${term}*,description.ilike.*${term}*,location.ilike.*${term}*,category.ilike.*${term}*,subcategory.ilike.*${term}*`);

    const { data, error } = await query;
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Results with mobile app filter (Uppercase):', data);
    }
}

testSearch();
