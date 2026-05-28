import fs from 'fs';
import { PDFParse } from 'pdf-parse'; // o ver como esta exportado
import path from 'path';

async function run() {
    console.log("Probando talavera pdf...");
    try {
        const response = await fetch('https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260513.pdf');
        const arrayBuffer = await response.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        
        let PDFP;
        try {
            PDFP = require('pdf-parse');
        } catch(e) {
            const mod = await import('pdf-parse');
            PDFP = mod.default || mod.PDFParse || mod;
        }

        let text;
        if (typeof PDFP === 'function' && !PDFP.prototype?.getText) {
             const data = await PDFP(Buffer.from(arrayBuffer));
             text = data.text;
        } else {
             const parser = new PDFP(buffer);
             const result = await parser.getText();
             text = result.text;
        }
        
        const lines = text.split('\n');
        let count = 0;
        for (const line of lines) {
            const rawLine = line.trim();
            const match = rawLine.match(/^(.+?)\s+([\d,.]+)\s+([\d,.]+)\s+(Unidad|Kg\.\/v\.|Kg\.\/c\.)$/i);
            if (match) {
                console.log("MATCH:", match[1], " | ", match[2], " | ", match[3], " | ", match[4]);
                count++;
            }
        }
        console.log("Total matches:", count);

    } catch (e) {
        console.error("Error:", e);
    }
}
run();
