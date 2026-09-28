import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    const id = 673078840;
    const phoneRes = await fetch(`https://www.olx.pt/api/v1/offers/${id}/phones/`, {
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json"
        }
    });
    if (phoneRes.ok) {
        const phoneData = await phoneRes.json();
        console.log("Phone:", phoneData);
    } else {
        console.log("Phone failed", phoneRes.status, await phoneRes.text());
    }
}
run();
