const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMultipleOr() {
    let q = supabase.from('listings').select('title').eq('status', 'active');
    
    // First OR
    q = q.or('tenant_id.eq.69d55371-2f70-4e67-b55c-4502bce305bb,shared_to_equipop.eq.true');
    
    // Second OR
    const term = 'cabezada';
    q = q.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
    
    console.log(q.url.toString());
    
    const { data, error } = await q;
    console.log('Results:', data ? data.length : 0);
    console.log('Error:', error);
}

testMultipleOr();
