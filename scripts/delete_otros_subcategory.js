const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteSubcategory() {
    const { data, error } = await supabase
        .from('subcategories')
        .delete()
        .eq('category_id', 'ganaderia')
        .eq('name', 'Otros')
        .is('tenant_id', null);

    if (error) {
        console.error('Error deleting subcategory:', error);
    } else {
        console.log('Successfully deleted subcategory Ganadería > Otros');
    }
}
deleteSubcategory();
