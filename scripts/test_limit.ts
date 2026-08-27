import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const MARKET_ID = 'b1a7d65b-e923-4c91-9c10-eb5bcbe63290';

async function main() {
    const { data, error } = await supabase
        .from('livestock_prices')
        .select('*')
        .eq('market_source_id', MARKET_ID)
        .eq('normalized_category', 'terneros_machos')
        .order('date', { ascending: false })
        .limit(10000);
        
    console.log("Returned rows:", data?.length);
}
main();
