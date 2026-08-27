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
        .eq('normalized_category', 'terneros_machos')
        .order('date', { ascending: false });
        
    const firstSeen = new Map<string, string>();
    const lastSeen = new Map<string, string>();
    const counts = new Map<string, number>();
    
    for (const d of data!) {
        const name = d.category_name;
        if (!lastSeen.has(name)) lastSeen.set(name, d.date);
        firstSeen.set(name, d.date);
        counts.set(name, (counts.get(name) || 0) + 1);
    }
    
    for (const [name, count] of counts.entries()) {
        console.log(`${name}: ${count} records. From ${firstSeen.get(name)} to ${lastSeen.get(name)}`);
    }
}
main();
