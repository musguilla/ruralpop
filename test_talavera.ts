import { TalaveraParser } from './src/lib/services/etl/parsers/TalaveraParser';

async function test() {
    const res = await TalaveraParser.parse({} as any);
    console.log(res);
}

test().catch(console.error);
