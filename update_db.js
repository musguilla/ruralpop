const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function update() {
    const { data, error } = await supabase
        .from('listings')
        .update({ equipop_subcategory: 'Sillas de uso general' })
        .eq('equipop_subcategory', 'Sillas mixtas / uso general');
        
    console.log("Error:", error);
    console.log("Updated rows.");
}

update();
