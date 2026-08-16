require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    console.log("=== Testing Service Key with custom headers ===");
    
    // Test 1: Standard service key
    const client1 = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const res1 = await client1.from('listings').select('id').limit(1);
    console.log("Standard service key:", res1.error?.message || "SUCCESS");

    // Test 2: Anon apikey header + Service Role Authorization header
    const client2 = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
                }
            }
        }
    );
    const res2 = await client2.from('listings').select('id').limit(1);
    console.log("Anon apikey + Service Role Auth header:", res2.error?.message || "SUCCESS");
}

main();
