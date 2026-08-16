require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Let's check RPCs
    const { data, error } = await supabase.rpc('get_policies');
    console.log("Policies RPC:", data, error);
}

main();
