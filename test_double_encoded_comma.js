const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testDoubleEncodedComma() {
    const fetch = require('node-fetch');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/listings?select=id,title&or=(title.ilike.*Cabezada*%252Cdescription.ilike.*Cabezada*)';
    
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

testDoubleEncodedComma();
