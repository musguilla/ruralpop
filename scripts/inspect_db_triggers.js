require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabaseAdmin = createClient(url, secretKey);

    console.log("=== 1. Inspecting Database Triggers and Functions for 'full_name' ===");
    
    // We can query pg_proc to find any function definition containing 'full_name' or 'tsquery'
    const { data: procData, error: procErr } = await supabaseAdmin.rpc('exec_sql', {
        query: `SELECT proname, prosrc FROM pg_proc WHERE prosrc ILIKE '%full_name%' OR prosrc ILIKE '%tsquery%';`
    });

    if (procErr) {
        console.log("exec_sql RPC not available, running direct SQL query if possible or checking via query...");
        // Let's try raw query on pg_proc via REST or direct check
    } else {
        console.log("Matching functions:", procData);
    }
}

main();
