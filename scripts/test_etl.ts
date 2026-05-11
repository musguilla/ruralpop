import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { SalamancaParser } from '../src/lib/services/etl/parsers/SalamancaParser';
import { LeonParser } from '../src/lib/services/etl/parsers/LeonParser';
import { SieroParser } from '../src/lib/services/etl/parsers/SieroParser';
import { TalaveraParser } from '../src/lib/services/etl/parsers/TalaveraParser';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
    console.log("=== Testing Leon ===");
    try {
        const { data } = await supabase.from('market_sources').select('*').eq('name', 'Lonja Agropecuaria de León').single();
        const result = await LeonParser.parse(data);
        const maxDate = new Date(Math.max(...result.prices.map(p => new Date(p.date).getTime())));
        console.log(`Found ${result.prices.length} prices for Leon. Latest Date: ${maxDate}`);
    } catch (e: any) {
        console.error("Leon failed:", e.message);
    }

    console.log("\n=== Testing Salamanca ===");
    try {
        const { data } = await supabase.from('market_sources').select('*').eq('name', 'Lonja de Salamanca').single();
        const result = await SalamancaParser.parse(data);
        const maxDate = new Date(Math.max(...result.prices.map(p => new Date(p.date).getTime())));
        console.log(`Found ${result.prices.length} prices for Salamanca. Latest Date: ${maxDate}`);
    } catch (e: any) {
        console.error("Salamanca failed:", e.message);
    }

    console.log("\n=== Testing Siero ===");
    try {
        const { data } = await supabase.from('market_sources').select('*').eq('name', 'Mercado Nacional de Ganado de Pola de Siero').single();
        const result = await SieroParser.parse(data);
        const maxDate = new Date(Math.max(...result.prices.map(p => new Date(p.date).getTime())));
        console.log(`Found ${result.prices.length} prices for Siero. Latest Date: ${maxDate}`);
    } catch (e: any) {
        console.error("Siero failed:", e.message);
    }

    console.log("\n=== Testing Talavera ===");
    try {
        const { data } = await supabase.from('market_sources').select('*').eq('name', 'Lonja Agropecuaria de Talavera de la Reina').single();
        const result = await TalaveraParser.parse(data);
        const maxDate = new Date(Math.max(...result.prices.map(p => new Date(p.date).getTime())));
        console.log(`Found ${result.prices.length} prices for Talavera. Latest Date: ${maxDate}`);
    } catch (e: any) {
        console.error("Talavera failed:", e.message);
    }
}
run();
