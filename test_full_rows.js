const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkFull() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data } = await supabase
        .from('listings')
        .select('*')
        .in('title', ['Pantalones niña Equitheme ', 'Cincha CWD ', 'Muserola Alemana Dyon ', 'Cabezada cwd ']);
        
    console.log(JSON.stringify(data, null, 2));
}

checkFull();
