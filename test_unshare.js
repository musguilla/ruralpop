require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const listingId = 'eefce1b2-113c-44c8-b570-ef02660a95fa'; // Example: Montura mixta ID... wait I don't have the ID.
  
  // Let's just find "Montura mixta"
  const { data: items } = await supabaseAdmin.from('listings').select('id, title, shared_to_equipop').eq('title', 'Montura mixta');
  console.log("Found:", items);

  if (items && items.length > 0) {
      const id = items[0].id;
      console.log(`Unsharing ${id}...`);
      const { error } = await supabaseAdmin.from('listings').update({ shared_to_equipop: false }).eq('id', id);
      console.log("Error?", error);
      
      const { data: check } = await supabaseAdmin.from('listings').select('id, title, shared_to_equipop').eq('id', id);
      console.log("After update:", check);
  }
}

run();
