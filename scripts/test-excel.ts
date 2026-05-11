import * as xlsx from 'xlsx';
import * as path from 'path';

function run() {
    const filePath = path.join(process.cwd(), 'public', 'modelos_tractores_2015_2026.xlsx');
    console.log(`Reading: ${filePath}`);
    const workbook = xlsx.readFile(filePath);
    console.log("Sheets:", workbook.SheetNames);
    
    if (workbook.SheetNames.length > 1) {
        const sheetName = workbook.SheetNames[1];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        
        console.log(`\nReading Sheet: ${sheetName}`);
        console.log("Headers:", data[0]);
        console.log("Row 1:", data[1]);
        console.log(`Total rows in ${sheetName}: ${data.length}`);
    }
}
run();
