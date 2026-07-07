require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const slugs = [
    "montura-7kvxbyAYh1fIwbcRut1ms3",
    "se-vende-2qbvkpFOh99IorKQ3TaXr",
    "cincha-western-2FP0kxeLGamg1r0lRCt8La",
    "montura-zaldi-alta-escuela-5swWlQ0wg2zFNBECmcctHs"
  ];
  
  console.log("Looking up listings by exact slug...");

  for (const slug of slugs) {
      const { data: items, error: fetchErr } = await supabaseAdmin.from('listings').select('id, title, slug, shared_to_equipop').eq('slug', slug);
      console.log(`Querying for ${slug}...`);
      if (fetchErr) console.error(fetchErr);
      
      if (items && items.length > 0) {
          console.log(`Found: ${items[0].title} (${items[0].id})`);
          console.log(`Unsharing ${items[0].id}...`);
          const { error } = await supabaseAdmin.from('listings').update({ shared_to_equipop: false }).eq('id', items[0].id);
          if (error) console.log("Error updating:", error);
          else console.log("Success!");
      } else {
          console.log(`Not found by exact slug. Let's try matching the end of the ID...`);
          // Slug format is usually title-encodedId
          const parts = slug.split('-');
          const possibleIdSuffix = parts[parts.length - 1];
          // Or let's just search by ilike on the title part
          const possibleTitle = parts.slice(0, parts.length - 1).join(' ');
          console.log(`Trying ilike on title: ${possibleTitle}`);
          
          const { data: fallbackItems } = await supabaseAdmin.from('listings').select('id, title, slug, shared_to_equipop').ilike('title', possibleTitle);
          if (fallbackItems && fallbackItems.length > 0) {
              console.log(`Found via title: ${fallbackItems[0].title} (${fallbackItems[0].id})`);
              console.log(`Unsharing ${fallbackItems[0].id}...`);
              const { error } = await supabaseAdmin.from('listings').update({ shared_to_equipop: false }).eq('id', fallbackItems[0].id);
              if (error) console.log("Error updating:", error);
              else console.log("Success!");
          } else {
              console.log("Could not find this listing at all.");
          }
      }
  }
}

run();
