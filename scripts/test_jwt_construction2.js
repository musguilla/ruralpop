require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    console.log("AnonKey present:", !!anonKey, anonKey?.substring(0, 30));
    if (!anonKey) return;

    const parts = anonKey.split('.');
    console.log("Parts count:", parts.length);
    if (parts.length !== 3) return;

    const header = Buffer.from(parts[0], 'base64').toString();
    const payload = Buffer.from(parts[1], 'base64').toString();
    
    console.log("Header:", header);
    console.log("Payload:", payload);
}

main();
