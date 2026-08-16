require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
   const { data: sources } = await supabase.from('market_sources').select('*').ilike('name', '%Salamanca%').single();
   const { data: prices } = await supabase.from('livestock_prices')
      .select('category_name, normalized_category, date')
      .eq('market_source_id', sources.id)
      .eq('date', '2026-07-20')
      .limit(10);
      
   console.log("Recent prices with corrupted text:", prices);
}
check();
