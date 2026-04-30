import * as cheerio from 'cheerio';

async function run() {
    const response = await fetch('https://www.lonjadeleon.es/lonja-carne-de-vacuno-22-04-2026/');
    if (!response.ok) {
        console.error('Failed to fetch', response.status);
        return;
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Find tables
    const table = $('table').first();
    const rows = table.find('tr');
    
    console.log('Total rows:', rows.length);
    rows.each((i, row) => {
        const cells = $(row).find('td, th').map((j, cell) => $(cell).text().trim()).get();
        if (i < 20) { // Print first 20 rows
            console.log(`Row ${i}:`, cells);
        }
    });
}
run();
