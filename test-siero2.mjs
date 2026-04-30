import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

async function run() {
    console.log("Fetching page...");
    const response = await fetch("https://www.ayto-siero.es/servicios-municipales/mercado-nacional-de-ganado/");
    const html = await response.text();
    const $ = cheerio.load(html);
    
    $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.toLowerCase().endsWith('.pdf')) {
            console.log(href);
        }
    });
}
run();
