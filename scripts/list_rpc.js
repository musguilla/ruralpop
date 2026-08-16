require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Let's test calling various rpc functions
    const funcs = ['increment_listing_visits', 'exec_sql', 'execute_sql', 'admin_set_featured', 'set_featured'];
    for (const f of funcs) {
        const { error } = await supabase.rpc(f, {});
        console.log(`RPC ${f}:`, error?.message);
    }
}

main();
