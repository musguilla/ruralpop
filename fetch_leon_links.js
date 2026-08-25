const https = require('https');

async function fetchPage(page) {
    return new Promise((resolve, reject) => {
        const url = `https://www.lonjadeleon.es/category/cotizaciones/carne-vacuno/page/${page}/`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', reject);
        });
    });
}

async function main() {
    let allLinks = [];
    // Fetch pages 1 to 5 to get older links
    for (let i = 1; i <= 5; i++) {
        console.log("Fetching page " + i);
        const html = await fetchPage(i);
        const regex = /href="(https:\/\/www\.lonjadeleon\.es\/lonja-carne-de-vacuno-[^"]+)"/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
            allLinks.push(match[1]);
        }
        const regex2 = /href="(https:\/\/www\.lonjadeleon\.es\/lonja-carne-vacuno-[^"]+)"/g;
        while ((match = regex2.exec(html)) !== null) {
            allLinks.push(match[1]);
        }
    }
    const uniqueLinks = [...new Set(allLinks)];
    console.log(JSON.stringify(uniqueLinks, null, 2));
}

main();
