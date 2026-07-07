const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDiff() {
    const term = 'Cabezada';
    
    // Test with *
    let query1 = supabase.from('listings').select('title, category, subcategory').eq('status', 'active');
    query1 = query1.or(`title.ilike.*${term}*,description.ilike.*${term}*,location.ilike.*${term}*,category.ilike.*${term}*,subcategory.ilike.*${term}*`);
    const { data: data1 } = await query1;
    
    // Test with %
    let query2 = supabase.from('listings').select('title, category, subcategory').eq('status', 'active');
    query2 = query2.or(`title.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%,category.ilike.%${term}%,subcategory.ilike.%${term}%`);
    const { data: data2 } = await query2;

    console.log('Results with *: ', data1 ? data1.length : 0);
    console.log('Results with %: ', data2 ? data2.length : 0);
}

testDiff();
