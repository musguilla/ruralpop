import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data: source } = await supabase.from('market_sources').select('id, name').ilike('name', '%Talavera%').single();
    
    const { data: snapshots, error } = await supabase
        .from('raw_market_snapshots')
        .select('created_at, parsed_successfully, checksum')
        .eq('market_source_id', source.id)
        .order('created_at', { ascending: false })
        .limit(3);
        
    console.log("Últimos snapshots de Talavera:");
    console.log(snapshots);
}
check();
