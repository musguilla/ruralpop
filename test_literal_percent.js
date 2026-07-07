const fetch = require('node-fetch');

async function testLiteralPercent() {
    const url = 'https://zrpucbuvojskcwrhwevv.supabase.co/rest/v1/listings?select=title&status=eq.active&or=(title.ilike.%cincha%,description.ilike.%cincha%)';
    try {
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
    } catch (e) {
        console.error('Error:', e);
    }
}
testLiteralPercent();
