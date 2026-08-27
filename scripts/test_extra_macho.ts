import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const MARKET_ID = 'b1a7d65b-e923-4c91-9c10-eb5bcbe63290';

async function main() {
    const { data } = await supabase
        .from('livestock_prices')
        .select('date')
        .eq('market_source_id', MARKET_ID)
        .eq('category_name', 'Ternero - Extra macho')
        .order('date', { ascending: true });
        
    console.log("Earliest:", data[0]?.date);
    console.log("Latest:", data[data.length - 1]?.date);
    console.log("Total:", data.length);
}
main();
