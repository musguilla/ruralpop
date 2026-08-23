require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
async function main() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase
        .from('listings')
        .select('id, title, image_urls, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
    console.log(JSON.stringify(data, null, 2));
}
main();
