import { TalaveraParser } from '../src/lib/services/etl/parsers/TalaveraParser';
async function run() {
    try {
        const result = await TalaveraParser.parse({} as any);
        console.log("Success! Prices:", result.prices.length);
    } catch(e) {
        console.error("Error:", e);
    }
}
run();
