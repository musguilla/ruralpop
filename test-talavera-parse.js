const mod = require('pdf-parse');
const PDFP = mod.default || mod.PDFParse || mod;

const test = async (url) => {
    console.log("Fetching", url);
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });
    const buffer = await response.arrayBuffer();
    try {
        let text = '';
        if (typeof PDFP === 'function' && !PDFP.prototype?.getText) {
            const data = await PDFP(Buffer.from(buffer));
            text = data.text;
        } else {
            const parser = new PDFP(new Uint8Array(buffer));
            const result = await parser.getText();
            text = result.text;
        }
        
        console.log("Parsed length:", text.length);
        console.log(text.slice(0, 100).replace(/\n/g, ' '));
        if (text.trim().length === 0) {
           console.log("TEXT IS EMPTY OR INVALID");
        }
    } catch(e) {
        console.error("Parse error:", e.message);
    }
};

const run = async () => {
    await test("https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260722.pdf");
    await test("https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260715_02.pdf");
    await test("https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260715.pdf");
}
run();
