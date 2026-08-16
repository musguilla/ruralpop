require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
   const { data: sources } = await supabase.from('market_sources').select('*').ilike('name', '%Talavera%').single();
   const { data: prices } = await supabase.from('livestock_prices')
      .select('date')
      .eq('market_source_id', sources.id)
      .order('date', { ascending: false })
      .limit(5);
      
   console.log("Recent prices for Talavera:", prices);
   console.log("Last success at:", sources.last_success_at);
}
check();
