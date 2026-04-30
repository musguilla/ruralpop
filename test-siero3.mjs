import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { PDFParse } from 'pdf-parse';

async function run() {
    console.log("Fetching page...");
    const response = await fetch("https://www.ayto-siero.es/portal-de-mercado-de-ganado/");
    const html = await response.text();
    const $ = cheerio.load(html);
    
    let c = 0;
    for (const el of $('a').toArray()) {
        const href = $(el).attr('href');
        if (href && href.toLowerCase().endsWith('.pdf')) {
            console.log("Found PDF:", href);
            if (href.toLowerCase().includes('abasto') || href.toLowerCase().includes('vida')) {
                const absoluteUrl = href.startsWith('http') ? href : `https://www.ayto-siero.es${href}`;
                const pdfRes = await fetch(absoluteUrl);
                const arrayBuffer = await pdfRes.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const parser = new PDFParse(buffer);
                const result = await parser.getText();
                console.log("--- TEXT ---");
                console.log(result.text);
                console.log("------------");
                c++;
                if (c >= 2) break; // one for abasto, one for vida
            }
        }
    }
}
run();
