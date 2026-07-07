const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMobileQueryStar() {
    const term = 'Cabezada';
    let supabaseQuery = supabase
        .from('listings')
        .select(`id, title`)
        .eq('status', 'active');
        
    supabaseQuery = supabaseQuery.or(`title.ilike.*${term}*,description.ilike.*${term}*,location.ilike.*${term}*,category.ilike.*${term}*,subcategory.ilike.*${term}*`);
    
    const { data, error } = await supabaseQuery;
    if (error) {
        console.error('Error in mobile query:', error);
    } else {
        console.log(`Mobile query with * returned ${data.length} results.`);
    }
}

testMobileQueryStar();
