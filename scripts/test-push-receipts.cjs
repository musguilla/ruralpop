const fetch = require('node-fetch');

async function testReceipts() {
    const to = "ExponentPushToken[vGBCigIgKAZCZZPaoT0S64]";
    console.log(`Testing push to ${to}...`);
    try {
        const resp = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: to,
                title: 'Test push',
                body: 'Testing your device.'
            })
        });
        const result = await resp.json();
        console.log("Push API Result:", JSON.stringify(result, null, 2));

        if (result.data && result.data.status === "ok") {
            const ticketId = result.data.id;
            console.log("Wait a short bit to query receipt...");
            await new Promise(r => setTimeout(r, 4000));
            const receiptResp = await fetch('https://exp.host/--/api/v2/push/getReceipts', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: [ticketId] })
            });
            const receiptRes = await receiptResp.json();
            console.log("Receipt Result:", JSON.stringify(receiptRes, null, 2));
        }

    } catch (err) {
        console.error("Push Request Error:", err);
    }
}

testReceipts();
