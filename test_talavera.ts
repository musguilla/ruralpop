import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
async function main() {
    const { data } = await supabase.from('livestock_prices').select('date, price_avg').eq('market_source_id', '8b3d87fa-21d7-4f6c-b364-e4c13a2948c2').eq('normalized_category', 'terneras_pais_200kg').order('date', { ascending: true }).limit(20);
    console.log(data);
}
main();
