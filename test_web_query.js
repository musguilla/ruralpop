const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testWebQuery() {
    const term = 'Cabezada';
    let query = supabase.from('listings').select('title');
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%,tags.cs.{"${term}"}`);
    
    const { data, error } = await query;
    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Query %${term}% returned ${data.length} results.`);
    }
}

testWebQuery();
