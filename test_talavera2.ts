import { TalaveraParser } from './src/lib/services/etl/parsers/TalaveraParser';

async function test() {
    const res = await TalaveraParser.parse({} as any);
    const dateCount: any = {};
    res.prices.forEach(p => {
        const d = p.date.toISOString().split('T')[0];
        dateCount[d] = (dateCount[d] || 0) + 1;
    });
    console.log("Precios extraídos por fecha:", dateCount);
}

test().catch(console.error);
