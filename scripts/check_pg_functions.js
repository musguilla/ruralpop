require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabaseAdmin = createClient(url, secretKey);

    // Let's test calling pg_proc via postgrest query or RPC if any exists
    // We can also test searching listings with plainto_tsquery or textSearch
    console.log("Testing textSearch on listings...");
    const { data: searchData, error: searchErr } = await supabaseAdmin
        .from('listings')
        .select('id, title')
        .textSearch('title', 'John Deere', { config: 'spanish', type: 'websearch' })
        .limit(5);

    console.log("textSearch websearch result:", searchErr || searchData);

    const { data: searchDataPlain, error: searchErrPlain } = await supabaseAdmin
        .from('listings')
        .select('id, title')
        .textSearch('title', 'John Deere', { config: 'spanish', type: 'plain' })
        .limit(5);

    console.log("textSearch plain result:", searchErrPlain || searchDataPlain);
}

main();
