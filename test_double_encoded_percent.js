const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testDoubleEncodedPercent() {
    const fetch = require('node-fetch');
    // %2525 is double encoded %
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/listings?select=id,title&or=(title.ilike.%2525Cabezada%2525)';
    
    const res = await fetch(url, {
        headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
    });
    
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
}

testDoubleEncodedPercent();
