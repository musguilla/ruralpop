const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkPolicies() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // We cannot query pg_policies via REST if it's not exposed, but we can try to fetch them via RPC if one exists.
    // Let's just do a normal fetch WITH the anon key to see if RLS blocks it.
    
    const { data, error } = await supabase
        .from('listings')
        .select('id, title, user_id')
        .eq('status', 'active')
        .in('title', ['Pantalones niña Equitheme ', 'Cincha CWD ', 'Cabezada cwd ']);
        
    console.log(error ? error : data);
}

checkPolicies();
