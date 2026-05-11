import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { SalamancaParser } from '../src/lib/services/etl/parsers/SalamancaParser.js';
import { LeonParser } from '../src/lib/services/etl/parsers/LeonParser.js';
import { SieroParser } from '../src/lib/services/etl/parsers/SieroParser.js';
import { TalaveraParser } from '../src/lib/services/etl/parsers/TalaveraParser.js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testLeon() {
    console.log("=== Testing Leon ===");
    try {
        const { data } = await supabase.from('market_sources').select('*').eq('name', 'Lonja Agropecuaria de León').single();
        const result = await LeonParser.parse(data);
        console.log(`Found ${result.prices.length} prices for Leon. Latest Date: ${result.prices[0]?.date}`);
    } catch (e) {
        console.error("Leon failed:", e.message);
    }
}

async function testSalamanca() {
    console.log("\n=== Testing Salamanca ===");
    try {
        const { data } = await supabase.from('market_sources').select('*').eq('name', 'Lonja de Salamanca').single();
        const result = await SalamancaParser.parse(data);
        console.log(`Found ${result.prices.length} prices for Salamanca. Latest Date: ${result.prices[0]?.date}`);
    } catch (e) {
        console.error("Salamanca failed:", e.message);
    }
}

async function testSiero() {
    console.log("\n=== Testing Siero ===");
    try {
        const { data } = await supabase.from('market_sources').select('*').eq('name', 'Mercado Nacional de Ganado de Pola de Siero').single();
        const result = await SieroParser.parse(data);
        console.log(`Found ${result.prices.length} prices for Siero. Latest Date: ${result.prices[0]?.date}`);
    } catch (e) {
        console.error("Siero failed:", e.message);
    }
}

async function testTalavera() {
    console.log("\n=== Testing Talavera ===");
    try {
        const { data } = await supabase.from('market_sources').select('*').eq('name', 'Lonja Agropecuaria de Talavera de la Reina').single();
        const result = await TalaveraParser.parse(data);
        console.log(`Found ${result.prices.length} prices for Talavera. Latest Date: ${result.prices[0]?.date}`);
    } catch (e) {
        console.error("Talavera failed:", e.message);
    }
}

async function run() {
    // Need to use ts-node to run ts files directly, but we are using node and importing TS. Wait, this will fail.
    console.log("We need to run this with ts-node or run MarketETLService via next app");
}
run();
