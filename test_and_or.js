const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAndOr() {
    let q = supabase.from('listings').select('title').eq('status', 'active');
    
    // search "Cabezada cwd" (2 words)
    const terms = ["Cabezada", "cwd"];
    const andConditions = terms.map(term => `or(title.ilike.*${term}*,description.ilike.*${term}*)`).join(',');
    
    q = q.or(`and(${andConditions})`);
    
    console.log(q.url.toString());
    
    const { data, error } = await q;
    console.log('Results with and(or(...)):', data ? data.length : 0);
    if (error) console.error(error);
}

testAndOr();
