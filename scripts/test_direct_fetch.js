require('dotenv').config({ path: '.env.local' });

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/listings?select=id&limit=1';
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log("=== Test 1: apikey=secret, auth=Bearer secret ===");
    let r1 = await fetch(url, {
        headers: { 'apikey': secretKey, 'Authorization': `Bearer ${secretKey}` }
    });
    console.log("Status:", r1.status, await r1.text());

    console.log("=== Test 2: apikey=anon, auth=Bearer secret ===");
    let r2 = await fetch(url, {
        headers: { 'apikey': anonKey, 'Authorization': `Bearer ${secretKey}` }
    });
    console.log("Status:", r2.status, await r2.text());

    console.log("=== Test 3: apikey=secret, auth=Bearer anon ===");
    let r3 = await fetch(url, {
        headers: { 'apikey': secretKey, 'Authorization': `Bearer ${anonKey}` }
    });
    console.log("Status:", r3.status, await r3.text());

    console.log("=== Test 4: apikey=secret, no auth ===");
    let r4 = await fetch(url, {
        headers: { 'apikey': secretKey }
    });
    console.log("Status:", r4.status, await r4.text());
}

main();
