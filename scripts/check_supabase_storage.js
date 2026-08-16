require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);

    const { data: count, error } = await supabaseAdmin
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .contains('image_urls', ['supabase.co']);

    console.log("Count of listings with supabase storage in image_urls:", count);
}

main();
