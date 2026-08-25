import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data: sources } = await supabase.from('market_sources').select('id, name').ilike('name', '%León%');
    console.log("Sources:", sources);
    
    if (sources && sources.length > 0) {
        const { data } = await supabase
            .from('livestock_prices')
            .select('date')
            .eq('market_source_id', sources[0].id)
            .order('date', { ascending: false });
        
        const uniqueDates = [...new Set(data.map(d => d.date))];
        console.log("Current DB Dates for Leon:");
        console.log(uniqueDates);
    }
}
main();
