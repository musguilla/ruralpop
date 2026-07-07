const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSearch() {
    let query = supabase.from('listings').select('title, tenant_id, status, is_featured').ilike('title', '%cabezada%');

    const { data, error } = await query;
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Results:', data);
    }
}

testSearch();
