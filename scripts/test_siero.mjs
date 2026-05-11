import * as cheerio from 'cheerio';
async function run() {
    const response = await fetch('https://www.ayto-siero.es/portal-de-mercado-de-ganado/');
    const html = await response.text();
    const $ = cheerio.load(html);
    const pdfLinks = [];
    $('a').each((i, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        if (href && href.endsWith('.pdf')) {
            pdfLinks.push({ text, href });
        }
    });
    console.log(pdfLinks.slice(0, 20));
}
run();
