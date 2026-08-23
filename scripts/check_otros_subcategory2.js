const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSubcategory() {
    const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', 'ganaderia')
        .eq('name', 'Otros')

    if (error) {
        console.error('Error fetching subcategories:', error);
    } else {
        console.log('Subcategory Otros:', data);
    }
}
checkSubcategory();
