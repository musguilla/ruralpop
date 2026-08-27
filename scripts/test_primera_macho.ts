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
        .eq('category_name', 'Ternero - Primera macho')
        .order('date', { ascending: true });
        
    let lastDate = new Date(data![0].date);
    for (let i = 1; i < data!.length; i++) {
        const d = new Date(data![i].date);
        const diffDays = (d.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 30) {
            console.log(`Gap found: from ${lastDate.toISOString().split('T')[0]} to ${d.toISOString().split('T')[0]} (${diffDays} days)`);
        }
        lastDate = d;
    }
    console.log("Done checking Primera macho");
}
main();
