import { SieroParser } from '../src/lib/services/etl/parsers/SieroParser';
async function run() {
    try {
        const result = await SieroParser.parse({ source_url: "https://www.ayto-siero.es/portal-de-mercado-de-ganado/" } as any);
        console.log("Success! Prices:", result.prices.length);
    } catch(e) {
        console.error("Error:", e);
    }
}
run();
