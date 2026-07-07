require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const titles = ["Se vende montura", "Sudadero RAID"];
  
  for (const title of titles) {
      const { data: items } = await supabaseAdmin.from('listings').select('id, title, shared_to_equipop').eq('title', title);
      console.log("Found:", items);

      if (items && items.length > 0) {
          for (const item of items) {
              console.log(`Unsharing ${item.id}...`);
              const { error } = await supabaseAdmin.from('listings').update({ shared_to_equipop: false }).eq('id', item.id);
              console.log("Error?", error);
          }
      }
  }
}

run();
