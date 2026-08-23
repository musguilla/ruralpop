const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteSubcategory() {
    const { data, error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', 'e9ae9902-497e-4b2b-ba23-14f57758ef20')

    if (error) {
        console.error('Error deleting subcategory:', error);
    } else {
        console.log('Successfully deleted subcategory Ganadería > Otros');
    }
}
deleteSubcategory();
