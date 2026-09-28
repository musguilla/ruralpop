import * as cheerio from 'cheerio';

async function run() {
    const html = await fetch("https://www.ayto-siero.es/portal-de-mercado-de-ganado/").then(r => r.text());
    const $ = cheerio.load(html);
    const pdfLinks: { url: string, type: string }[] = [];
    
    // Support old structure
    $('a').each((i, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().toLowerCase();
        if (href && href.endsWith('.pdf')) {
            if (text.includes('precio') || text.includes('cotizaci')) {
                if (text.includes('vida')) pdfLinks.push({ url: href, type: 'vida' });
                else if (text.includes('abasto')) pdfLinks.push({ url: href, type: 'abasto' });
                else if (text.includes('terneros') || text.includes('jueves')) pdfLinks.push({ url: href, type: 'recría' });
            }
        }
    });

    // Support new structure WP File Download
    $('input.wpfd_file_preview_link_download').each((i, el) => {
        const url = $(el).attr('value');
        const text = ($(el).attr('data-filetitle') || '').toLowerCase();
        if (url && (text.includes('precio') || text.includes('cotizaci'))) {
            if (text.includes('vida')) pdfLinks.push({ url, type: 'vida' });
            else if (text.includes('abasto')) pdfLinks.push({ url, type: 'abasto' });
            else if (text.includes('terneros') || text.includes('jueves')) pdfLinks.push({ url, type: 'recría' });
        }
    });

    console.log("Found PDFs:", pdfLinks);
}
run();
