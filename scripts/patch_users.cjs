const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function patch() {
    const { data } = await supabase.from('users').update({ 
        commercial_name: 'Ixorigue',
        name: 'Ixorigue',
        role: 'profesional' 
    }).eq('email', 'info@ixorigue.com').select('id, name, commercial_name, is_ghost, ghost_token');
    
    console.log("Ixorigue totally patched:", data);
}

patch();
