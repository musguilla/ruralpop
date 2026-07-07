const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkHeaders() {
    const fetch = require('node-fetch');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/listings?select=title&status=eq.active&or=(title.ilike.%25cincha%25)';
    
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
    });
    
    console.log(res.headers.raw());
}

checkHeaders();
