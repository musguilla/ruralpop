import { TalaveraParser } from '../src/lib/services/etl/parsers/TalaveraParser';
import { MarketSource } from '../src/types/livestock';

async function run() {
    const dummySource = { id: 'test', name: 'Talavera', source_url: '', source_type: 'pdf', active: true, etl_config: {} };
    try {
        console.log("Iniciando parse...");
        const result = await TalaveraParser.parse(dummySource as MarketSource);
        console.log("Parse terminado, precios:", result.prices.length);
    } catch(e) {
        console.error("Error capturado:", e);
    }
}
run();
