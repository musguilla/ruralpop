import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { TalaveraParser } from './src/lib/services/etl/parsers/TalaveraParser';

config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function inject() {
    try {
        console.log("1. Buscando fuente Talavera en BD...");
        const { data: source } = await supabase.from('market_sources').select('*').ilike('name', '%Talavera%').single();
        
        console.log("2. Descargando y parseando el PDF de Talavera...");
        const result = await TalaveraParser.parse(source as any);
        
        // Filtrar solo los precios del día 27 de mayo de 2026
        const newPrices = result.prices.filter(p => new Date(p.date).toISOString().startsWith('2026-05-27'));
        
        console.log(`3. Encontrados ${newPrices.length} precios listos para el 27 de mayo.`);
        
        if (newPrices.length === 0) {
            console.log("No se encontraron precios para inyectar.");
            return;
        }
        
        const pricesToInsert = newPrices.map(p => ({
            ...p,
            market_source_id: source.id,
        }));
        
        console.log("4. Inyectando precios en Supabase...");
        const { error } = await supabase
            .from('livestock_prices')
            .upsert(pricesToInsert, { onConflict: 'market_source_id, date, category_name, unit', ignoreDuplicates: true });
            
        if (error) {
            console.error("Error al inyectar:", error);
        } else {
            console.log("¡Inyección completada con éxito! Todos los precios del día 27 de mayo están en tu Base de Datos.");
            
            // Actualizamos la fecha de exito
            await supabase
                .from('market_sources')
                .update({ last_success_at: new Date().toISOString() })
                .eq('id', source.id);
        }
    } catch (err) {
        console.error("Fallo general:", err);
    }
}

inject();
