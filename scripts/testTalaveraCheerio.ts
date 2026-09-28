import * as cheerio from 'cheerio';
async function run() {
    const html = await fetch("https://www.talavera-ferial.com/14055/lonja-talavera/content/14080/cotizaciones-vacuno-2026/").then(r => r.text());
    const $ = cheerio.load(html);
    const pdfs: string[] = [];
    $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.toLowerCase().endsWith('.pdf')) {
            pdfs.push(href);
        }
    });
    console.log("PDFs:", pdfs);
}
run();
