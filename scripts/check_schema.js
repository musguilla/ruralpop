require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
async function main() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase.from('listings').select('image_urls').eq('id', 'fe437058-caee-49cb-bd67-00b47a702499').single();
    console.log(data);
}
main();
