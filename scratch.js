const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const parts = line.split('=');
    if (parts.length >= 2) acc[parts[0]] = parts.slice(1).join('=');
    return acc;
}, {});

const BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const BASE62_BIGINT = BigInt(62);
function decodeId(shortId) {
    let num = BigInt(0);
    for (let i = 0; i < shortId.length; i++) {
        const val = BASE62_CHARS.indexOf(shortId[i]);
        num = num * BASE62_BIGINT + BigInt(val);
    }
    let hex = num.toString(16).padStart(32, "0");
    return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join("-");
}

async function test() {
    const id = decodeId('ygVLZL8hfCj2yJyWQUclk');
    const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/listings?id=eq.${id}&select=image_urls`;
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
