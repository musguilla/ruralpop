const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testNoTenant() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    let q = supabase.from('listings').select('title').eq('status', 'active');
    
    // NO tenant_id filter!
    
    const term = 'Cabezada';
    q = q.or(`title.ilike.%${term}%`);
    
    const { data, error } = await q;
    console.log('Results WITHOUT tenant filter:', data ? data.length : 0);
    if (error) console.error(error);
}

testNoTenant();
