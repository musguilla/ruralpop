import { createClient } from '@supabase/supabase-js';
import { TalaveraParser } from '../src/lib/services/etl/parsers/TalaveraParser';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Obtener la fuente de Talavera
    const { data: source } = await supabase.from('market_sources').select('*').ilike('name', '%Talavera%').single();
    if (!source) {
        console.error("Talavera no encontrada en BD");
        return;
    }
    
    console.log("Iniciando parse directo...");
    try {
        const result = await TalaveraParser.parse(source as any);
        console.log(`Parseados ${result.prices.length} precios.`);
        
        if (result.prices.length > 0) {
            const pricesToInsert = result.prices.map(p => ({
                ...p,
                market_source_id: source.id,
            }));
            
            // Forzar inserción saltándose la validación de Snapshots
            const { error: insertError } = await supabase
                .from('livestock_prices')
                .upsert(pricesToInsert, { onConflict: 'market_source_id, date, category_name, unit', ignoreDuplicates: false });
                
            if (insertError) {
                console.error("Error insertando precios:", insertError);
            } else {
                console.log(`¡Inyectados exitosamente los ${result.prices.length} precios (ignorando checksums)!`);
            }
        }
    } catch (e) {
        console.error("Error extrayendo:", e);
    }
}
run();
