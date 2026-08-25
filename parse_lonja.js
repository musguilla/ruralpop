const https = require('https');
https.get('https://www.lonjadeleon.es/lonja-carne-vacuno-05-08-2026/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/<table.*?>(.*?)<\/table>/s);
    if (match) {
        const rows = match[1].split(/<tr.*?>/);
        rows.forEach(r => {
            const cells = r.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            if (cells) console.log(cells);
        });
    } else {
        console.log("No table found");
        console.log(data.slice(0, 1000));
    }
  });
});
