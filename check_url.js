const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUrl() {
    const term = 'Cabezada';
    let query = supabase.from('listings').select('title');
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%,tags.cs.{"${term}"}`);
    
    console.log(query.url.toString());
}

checkUrl();
