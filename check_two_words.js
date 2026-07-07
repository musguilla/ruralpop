const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQueryTwoWords() {
    const EQUIPOP_ID = '69d55371-2f70-4e67-b55c-4502bce305bb';
    const tenantFilter = `tenant_id.eq.${EQUIPOP_ID}`;

    let query = supabase.from('listings').select('title').eq('status', 'active').or(tenantFilter);
    const searchTerms = ['Cabezada', 'cwd'];
    const andConditions = searchTerms.map(term => `or(title.ilike.*${term}*,description.ilike.*${term}*,location.ilike.*${term}*,category.ilike.*${term}*,subcategory.ilike.*${term}*)`).join(',');
    
    query = query.or(`and(${andConditions})`);

    const { data, error } = await query;
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Results:', data);
    }
}

checkQueryTwoWords();
