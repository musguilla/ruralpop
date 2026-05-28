import { TalaveraParser } from '../src/lib/services/etl/parsers/TalaveraParser';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    console.log("Probando URLs generadas en TalaveraParser");
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - i);
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        const dateStr = `${year}${month}${day}`;
        const url = `https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_${dateStr}.pdf`;
        
        console.log(`Checking: ${url}`);
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`  -> Status: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);
    }
}
run();
