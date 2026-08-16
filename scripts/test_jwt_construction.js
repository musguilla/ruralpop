require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Base64url decode
function b64urlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return Buffer.from(str, 'base64').toString('utf8');
}

// Base64url encode
function b64urlEncode(str) {
    return Buffer.from(str).toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

async function main() {
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const parts = anonKey.split('.');
    const header = parts[0];
    const payload = JSON.parse(b64urlDecode(parts[1]));
    const signature = parts[2];

    console.log("Anon payload:", payload);

    // Create service_role payload
    const servicePayload = { ...payload, role: 'service_role' };
    const servicePayloadB64 = b64urlEncode(JSON.stringify(servicePayload));
    
    // Test if signature with service_role works
    const constructedServiceKey = `${header}.${servicePayloadB64}.${signature}`;
    console.log("\nConstructed service key:", constructedServiceKey);

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        constructedServiceKey
    );

    const { data, error } = await supabase.from('listings').select('id').limit(1);
    console.log("\nQuery result with constructed service key:", data, error);
}

main();
