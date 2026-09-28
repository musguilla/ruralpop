async function run() {
    const res = await fetch("https://www.olx.pt/api/v1/offers/672946025/phones/", {
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
            "Accept": "application/json"
        }
    });
    console.log(res.status);
    console.log(await res.text());
}
run();
