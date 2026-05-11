import * as cheerio from 'cheerio';
async function run() {
    const response = await fetch('https://www.lonjadeleon.es/category/cotizaciones/carne-vacuno/');
    const html = await response.text();
    const $ = cheerio.load(html);
    const links = [];
    $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.includes('vacuno')) {
            links.push(href);
        }
    });
    console.log(Array.from(new Set(links)).slice(0, 10));
}
run();
