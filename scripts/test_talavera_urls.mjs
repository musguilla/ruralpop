import fs from 'fs';
import fetch from 'node-fetch'; // Next.js environments might have global fetch, but just in case
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

async function testPdfUrl(url) {
    console.log(`\nTesting URL: ${url}`);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch: ${response.statusText}`);
            return;
        }
        const buffer = await response.arrayBuffer();
        const data = await pdfParse(Buffer.from(buffer));
        console.log(`PDF Text Length: ${data.text.length}`);
        
        // Log first 1000 characters to see format
        console.log("--- START TEXT ---");
        console.log(data.text.substring(0, 1500));
        console.log("--- END TEXT ---");

        const text = data.text;
        
        const lineRegex = /([A-Za-z\s.,\-()]+?)\s+(\d{1,3}(?:[.,]\d{2,3})?)\s+(?:-|s\/c|€\/Kg)\s+(\d{1,3}(?:[.,]\d{2,3})?)/g;
        let match;
        let count = 0;
        
        while ((match = lineRegex.exec(text)) !== null) {
            count++;
            console.log(`Match ${count}:`, {
                category: match[1].trim(),
                price1: match[2],
                price2: match[3]
            });
        }
        console.log(`Total records matched: ${count}`);
    } catch (e) {
        console.error(`Error processing ${url}:`, e);
    }
}

async function run() {
    await testPdfUrl('https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260513.pdf');
    await testPdfUrl('https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260520.pdf');
}

run();
