require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function clean() {
   const { data: sources } = await supabase.from('market_sources').select('*').ilike('name', '%Talavera%').single();
   const { data, error } = await supabase.from('livestock_prices')
      .delete()
      .eq('market_source_id', sources.id)
      .gte('date', '2026-07-15');
      
   console.log("Deleted recent prices:", error || "Success");
   
   const { data: snapData, error: snapError } = await supabase.from('raw_market_snapshots')
      .delete()
      .eq('market_source_id', sources.id);
      
   console.log("Deleted old snapshots to force update:", snapError || "Success");
}
clean();
