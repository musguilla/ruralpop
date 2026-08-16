require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = 'sb_secret_zo6E6YvBYltAqRmLbmGOiA_zk3Xrt9U';

    console.log("Testing with secretKey as key param...");
    const client1 = createClient(url, secretKey);
    const res1 = await client1.from('listings').select('id').limit(1);
    console.log("Res 1:", res1.error?.message || "SUCCESS");

    console.log("\nTesting fetch with custom headers...");
    const fetch = (await import('node-fetch')).default;
    const res2 = await fetch(`${url}/rest/v1/listings?select=id&limit=1`, {
        headers: {
            'apikey': secretKey,
            'Authorization': `Bearer ${secretKey}`
        }
    });
    console.log("Res 2 status:", res2.status, await res2.text());
}

main();
