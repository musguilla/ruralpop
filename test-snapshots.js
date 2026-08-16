require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
   const { data: sources } = await supabase.from('market_sources').select('*').ilike('name', '%Salamanca%').single();
   if (!sources) return console.log("No source");
   
   const { data: snapshots } = await supabase.from('raw_market_snapshots')
      .select('created_at, parsed_successfully, content_type')
      .eq('market_source_id', sources.id)
      .order('created_at', { ascending: false })
      .limit(5);
      
   console.log("Recent snapshots:", snapshots);
}
check();
