const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testTagsQuery() {
    let q = supabase.from('listings').select('id, title, tags').eq('status', 'active');
    q = q.or('tenant_id.eq.69d55371-2f70-4e67-b55c-4502bce305bb');
    
    const term = 'Cabezada';
    q = q.or(`title.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%,tags.cs.{"${term}"}`);
    
    const { data, error } = await q;
    console.log('Results:', data ? data.length : 0);
    if (error) console.error('Error:', error);
}

testTagsQuery();
