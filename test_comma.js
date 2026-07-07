const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function testCommaEncoding() {
    // This is the EXACT string URLSearchParams would produce if it encodes the comma to %2C
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + 
        '/rest/v1/listings?select=title&status=eq.active' + 
        '&or=(tenant_id.eq.69d55371-2f70-4e67-b55c-4502bce305bb)' +
        '&or=(title.ilike.%25cincha%25%2Cdescription.ilike.%25cincha%25)';
        
    console.log('Sending URL:', url);
    
    const res = await fetch(url, {
        headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
    });
    
    const text = await res.text();
    console.log('Response Status:', res.status);
    console.log('Response:', text);
}

testCommaEncoding();
