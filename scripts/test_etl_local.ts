import { MarketETLService } from '../src/lib/services/etl/MarketETLService';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: source } = await supabase.from('market_sources').select('*').ilike('name', '%Talavera%').single();
    if (!source) {
        console.error("Talavera no encontrada");
        return;
    }
    
    console.log("Forzando ETL para:", source.name);
    try {
        await MarketETLService.run(source.id);
        console.log("¡Terminado sin lanzar catch externo!");
    } catch (e) {
        console.error("Error capturado desde MarketETLService.run():", e);
    }
}
run();
