import * as cheerio from 'cheerio';
import { PDFParse } from 'pdf-parse';
import fetch from 'node-fetch';

async function run() {
    const response = await fetch("https://www.ayto-siero.es/servicios-municipales/mercado-nacional-de-ganado/");
    const html = await response.text();
    const $ = cheerio.load(html);
    
    for (const el of $('a').toArray()) {
        const href = $(el).attr('href');
        if (href && href.endsWith('.pdf')) {
            console.log(href);
            const absoluteUrl = href.startsWith('http') ? href : `https://www.ayto-siero.es${href}`;
            const pdfRes = await fetch(absoluteUrl);
            const arrayBuffer = await pdfRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const parser = new PDFParse(buffer);
            const result = await parser.getText();
            console.log("-----");
            console.log(result.text.split('\n').slice(0, 30).join('\n'));
            console.log("-----");
            break; // Just one for now
        }
    }
}
run();
