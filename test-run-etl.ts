import { config } from 'dotenv';
config({ path: '.env.local' });
import { MarketETLService } from './src/lib/services/etl/MarketETLService';
import { createClient } from '@supabase/supabase-js';

async function run() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: sources } = await supabase.from('market_sources').select('*').ilike('name', '%Salamanca%').single();
    if (sources) {
        console.log("Running for source:", sources.id);
        await MarketETLService.run(sources.id);
    }
}
run();
