import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("Updating name of Remolques agrícolas -> Remolques");
    let { error: e1 } = await supabaseAdmin.from('subcategories')
        .update({ name: 'Remolques' })
        .eq('category_id', 'maquinaria')
        .eq('name', 'Remolques agrícolas');
    if (e1) console.error("Error updating", e1);

    console.log("Done.");
}
run();
