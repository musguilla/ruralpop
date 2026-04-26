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
    
    // Calculate date 30 days from now in ISO format
    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + 30);
    const featuredUntilIso = featuredUntil.toISOString();

    const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/listings?id=eq.${id}`;
    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'apikey': env.SUPABASE_SERVICE_ROLE_KEY.replace(/"/g, '').replace(/'/g, ''),
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY.replace(/"/g, '').replace(/'/g, '')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            is_featured: true,
            featured_until: featuredUntilIso
        })
    });
    
    if (response.ok) {
        console.log(`Successfully featured listing ${id} until ${featuredUntilIso}`);
    } else {
        const err = await response.text();
        console.error("Failed to feature listing:", err);
    }
}
test();
