import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const MARKET_ID = 'b1a7d65b-e923-4c91-9c10-eb5bcbe63290';

async function main() {
    const { data } = await supabase
        .from('livestock_prices')
        .select('category_name')
        .eq('market_source_id', MARKET_ID)
        .gte('date', '2014-01-01')
        .lte('date', '2014-12-31')
        .ilike('category_name', '%ternero%');
    console.log("Ternero categories in 2014:", Array.from(new Set(data?.map(d => d.category_name))));
}
main();
