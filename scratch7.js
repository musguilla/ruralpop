const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const parts = line.split('=');
    if (parts.length >= 2) acc[parts[0]] = parts.slice(1).join('=');
    return acc;
}, {});
async function test() {
    const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/listings?select=title,created_at,image_urls,media,user_id&order=created_at.desc&limit=5`;
    const response = await fetch(url, {
        headers: {
            'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY.replace(/"/g, '').replace(/'/g, ''),
            'Authorization': `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY.replace(/"/g, '').replace(/'/g, '')}`
        }
    });
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
}
test();
