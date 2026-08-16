require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
   const { data: sources } = await supabase.from('market_sources').select('*').ilike('name', '%Talavera%').single();
   console.log("Last success:", sources.last_success_at);
   console.log("Last error:", sources.last_error_at);
}
check();
