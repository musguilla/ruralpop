import * as cheerio from 'cheerio';
async function run() {
    const response = await fetch('https://www.lonjadeleon.es/lonja-carne-de-vacuno-29-04-2026/');
    const html = await response.text();
    const $ = cheerio.load(html);
    console.log(`Found ${$('table').length} tables`);
    $('table').each((i, el) => {
        console.log(`Table ${i} text start:`, $(el).text().substring(0, 100).replace(/\n/g, ' '));
    });
}
run();
