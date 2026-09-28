import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    const adRes = await fetch("https://www.olx.pt/d/anuncio/vitelas-cruzadas-de-limousine-IDJxC09.html?search_reason=search%7Corganic", {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
        }
    });
    
    const adHtml = await adRes.text();
    const stateMatch = adHtml.match(/window\.__PRERENDERED_STATE__\s*=\s*"(.*?)";/);
    if (stateMatch) {
        const decoded = JSON.parse('"' + stateMatch[1] + '"'); 
        const stateObj = JSON.parse(decoded);
        console.log("Photos:", stateObj?.ad?.ad?.photos);
    }
}
run();
