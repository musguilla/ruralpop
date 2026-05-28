import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data: source } = await supabase.from('market_sources').select('id, name').ilike('name', '%Talavera%').single();
    console.log("Source ID:", source.id);
    
    const { data: prices, error } = await supabase
        .from('livestock_prices')
        .select('date, category_name, price_avg')
        .eq('market_source_id', source.id)
        .gte('date', '2026-05-20')
        .order('date', { ascending: false });
        
    console.log(`Encontrados ${prices?.length} precios desde el 20 de mayo.`);
    if (prices?.length > 0) {
        console.log("Fechas únicas guardadas:");
        const uniqueDates = [...new Set(prices.map(p => p.date))];
        console.log(uniqueDates);
    }
}
check();
