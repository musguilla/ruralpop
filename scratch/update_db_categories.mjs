import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const matchUrl = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
  const matchKey = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
  if (matchUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = matchUrl[1];
  if (matchKey) process.env.SUPABASE_SERVICE_ROLE_KEY = matchKey[1];
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    console.log("Updating 'forraje' label...");
    const { error: updateError } = await supabase
        .from('categories')
        .update({ name: 'Forraje y alimentación animal' })
        .eq('id', 'forraje');
    if (updateError) console.error("Error updating forraje:", updateError);

    console.log("Inserting 'agricultura' category...");
    const { error: insertCatError } = await supabase
        .from('categories')
        .upsert({ id: 'agricultura', name: 'Agricultura', order_index: 45 });
    if (insertCatError) console.error("Error inserting agricultura:", insertCatError);

    console.log("Inserting subcategories for 'agricultura'...");
    const subcats = [
        { category_id: 'agricultura', name: 'Semillas', order_index: 10 },
        { category_id: 'agricultura', name: 'Plantas y plantones', order_index: 20 }
    ];
    
    // Check if they already exist
    const { data: existingSubcats } = await supabase.from('subcategories').select('name').eq('category_id', 'agricultura');
    const existingNames = existingSubcats?.map(s => s.name) || [];

    for (const sub of subcats) {
        if (!existingNames.includes(sub.name)) {
            const { error: insertSubError } = await supabase.from('subcategories').insert(sub);
            if (insertSubError) console.error("Error inserting", sub.name, ":", insertSubError);
        }
    }

    console.log("Database update complete.");
}
main();
