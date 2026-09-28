import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    console.log("Fetching OLX search page...");
    const searchRes = await fetch("https://www.olx.pt/animais/animais-de-quinta/vacas/?page=1", {
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
        }
    });
    const searchHtml = await searchRes.text();
    const stateMatch = searchHtml.match(/window\.__PRERENDERED_STATE__\s*=\s*"(.*?)";/);
    if (stateMatch) {
        const decoded = JSON.parse('"' + stateMatch[1] + '"'); 
        const stateObj = JSON.parse(decoded);
        const elements = stateObj?.listing?.listing?.ads;
        if (elements) {
            console.log("Found", elements.length, "ads on page 1!");
            console.log("First 3 titles:", elements.slice(0, 3).map(e => e.title));
            console.log("First ad URL:", elements[0].url);
        } else {
            console.log("No ads found in state");
        }
    }
}
run();
