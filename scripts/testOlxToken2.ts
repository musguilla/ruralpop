import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    const adRes = await fetch("https://www.olx.pt/d/anuncio/vitelas-barrosa-puras-IDJyayk.html", { headers: { "User-Agent": "Mozilla/5.0" } });
    const adHtml = await adRes.text();
    const stateMatch = adHtml.match(/window\.__PRERENDERED_STATE__\s*=\s*"(.*?)";/);
    if (stateMatch) {
        const decoded = JSON.parse('"' + stateMatch[1] + '"'); 
        const stateObj = JSON.parse(decoded);
        console.log("Keys:", Object.keys(stateObj));
        console.log("Auth config:", Object.keys(stateObj?.auth || {}));
    }
    
    // Check if token is in html
    const tokenMatch = adHtml.match(/"accessToken":"(.*?)"/);
    if (tokenMatch) {
        console.log("Token:", tokenMatch[1].substring(0, 15) + "...");
    }
}
run();
