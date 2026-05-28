import { TalaveraParser } from '../src/lib/services/etl/parsers/TalaveraParser';
import { MarketSource } from '../src/types/livestock';

async function run() {
    const dummySource = { id: 'test', name: 'Talavera', source_url: '', source_type: 'pdf', active: true, etl_config: {} };
    try {
        console.log("Iniciando parse detallado...");
        
        // Copia exacta del fetch en TalaveraParser
        const today = new Date();
        const fetchPromises = [];
        for (let i = 0; i < 14; i++) {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() - i);
            const year = targetDate.getFullYear();
            const month = String(targetDate.getMonth() + 1).padStart(2, '0');
            const day = String(targetDate.getDate()).padStart(2, '0');
            const dateStr = `${year}${month}${day}`;
            const url = `https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_${dateStr}.pdf`;
            
            console.log(`Buscando: ${url}`);
        }
        
        const result = await TalaveraParser.parse(dummySource as MarketSource);
        console.log(`Precios extraidos totales: ${result.prices.length}`);
        
        // agrupar por fechas
        const counts: Record<string, number> = {};
        for (const p of result.prices) {
            const d = p.date.toISOString();
            counts[d] = (counts[d] || 0) + 1;
        }
        console.log("Por fecha:", counts);

    } catch(e) {
        console.error("Error capturado:", e);
    }
}
run();
