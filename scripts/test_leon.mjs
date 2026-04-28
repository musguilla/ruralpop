import * as cheerio from 'cheerio';

async function testLeon() {
    const res = await fetch('https://www.lonjadeleon.es/category/cotizaciones/carne-vacuno/');
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // They usually use an article or div with the table
    // Let's get the first table
    const table = $('table').first();
    console.log("Table exists:", table.length > 0);
    
    const rows = [];
    table.find('tr').each((i, el) => {
        const row = [];
        $(el).find('td, th').each((j, td) => {
            row.push($(td).text().trim());
        });
        rows.push(row);
    });
    
    console.log(rows);
    
    // Find the date (usually in the title of the article or before the table)
    const dateText = $('h2, h3, .post-title, .entry-title').first().text();
    console.log("Possible date:", dateText);
}

testLeon().catch(console.error);
