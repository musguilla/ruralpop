require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);

    const { count, error } = await supabaseAdmin
        .from('listings')
        .select('*', { count: 'exact', head: true })
        // A hack to check if text representation contains supabase.co
        // But postgrest doesn't allow cast to text in eq or ilike easily via JS client.
        // We'll just fetch a few.
}

main();
