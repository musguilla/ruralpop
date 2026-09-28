import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { TalaveraParser } from '../src/lib/services/etl/parsers/TalaveraParser';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
    const { data: source } = await supabase.from('market_sources').select('*').ilike('name', '%Talavera%').single();
    if (!source) {
        console.log("Source not found");
        return;
    }
    console.log("Source:", source);
    try {
        const result = await TalaveraParser.parse(source);
        console.log("Result success! Extracted", result.prices.length, "prices");
    } catch(e) {
        console.error("Parse Error:", e);
    }
}
run();
