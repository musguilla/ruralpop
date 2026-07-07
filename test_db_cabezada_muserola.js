const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function searchBoth() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // search for cabezada OR muserola
    let q = supabase.from('listings').select('title').eq('status', 'active');
    q = q.or('tenant_id.eq.69d55371-2f70-4e67-b55c-4502bce305bb');
    q = q.or('title.ilike.*cabezada*,title.ilike.*muserola*');
    
    const { data } = await q;
    console.log('Results with cabezada OR muserola:');
    console.log(data);
}

searchBoth();
