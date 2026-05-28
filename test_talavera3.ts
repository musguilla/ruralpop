import { TalaveraParser } from './src/lib/services/etl/parsers/TalaveraParser';

async function test() {
    const res = await TalaveraParser.parse({} as any);
    const may27 = res.prices.filter(p => p.date.toISOString().startsWith('2026-05-27'));
    console.log(`Hay ${may27.length} precios con fecha 27. Primer elemento:`, may27[0]);
    
    if (may27.length === 0) {
        console.log("Primer precio de todos:", res.prices[0]);
    }
}

test().catch(console.error);
