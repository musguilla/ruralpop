const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkFeatured() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data, error } = await supabase.from('listings').select('title, is_featured').or('tenant_id.eq.69d55371-2f70-4e67-b55c-4502bce305bb');
    console.log(data);
}

checkFeatured();
