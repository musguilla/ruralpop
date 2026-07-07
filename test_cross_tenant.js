const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkAll() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data: panta } = await supabase.from('listings').select('title, tenant_id').ilike('title', '%pantalones%');
    console.log("Pantalones in DB:", panta);

    const { data: cabezada } = await supabase.from('listings').select('title, tenant_id').ilike('title', '%cabezada%');
    console.log("Cabezada in DB:", cabezada);
}

checkAll();
