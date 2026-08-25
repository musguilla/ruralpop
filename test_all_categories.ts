import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const MARKET_ID = 'b1a7d65b-e923-4c91-9c10-eb5bcbe63290';

async function main() {
    const { data } = await supabase
        .from('livestock_prices')
        .select('date, category_name')
        .eq('market_source_id', MARKET_ID)
        .lt('date', '2023-01-01');
        
    const categories = new Set(data?.map(d => d.category_name));
    console.log("Categories before 2023:", Array.from(categories));
}
main();
