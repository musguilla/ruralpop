import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("Updating listings subcategory Remolques agrícolas -> Remolques");
    let { error: e1, count } = await supabaseAdmin.from('listings')
        .update({ subcategory: 'Remolques' })
        .eq('category', 'maquinaria')
        .eq('subcategory', 'Remolques agrícolas');
    if (e1) console.error("Error updating listings", e1);
    else console.log("Listings updated.");
    console.log("Done.");
}
run();
