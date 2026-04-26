import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("Updating name of Desbroce -> Mantenimiento de fincas");
    let { error: e1 } = await supabaseAdmin.from('subcategories')
        .update({ name: 'Mantenimiento de fincas' })
        .eq('category_id', 'servicios')
        .eq('name', 'Desbroce');
    if (e1) console.error("Error updating", e1);

    console.log("Inserting new ones...");
    let { error: e2 } = await supabaseAdmin.from('subcategories')
        .insert([
            { category_id: 'servicios', name: 'Cerramientos y vallados', order_index: 5 },
            { category_id: 'servicios', name: 'Construcción rural', order_index: 6 },
            { category_id: 'servicios', name: 'Esquiladores', order_index: 7 },
            { category_id: 'servicios', name: 'Servicios forestales', order_index: 15 }
        ]);
    if (e2) console.error("Error inserting", e2);

    console.log("Updating order to be alphabetical...");
    const orders = {
        'Cerramientos y vallados': 10,
        'Construcción rural': 20,
        'Esquiladores': 30,
        'Herradores': 40,
        'Mantenimiento de fincas': 50,
        'Servicios forestales': 60,
        'Transporte': 70,
        'Veterinarios': 80
    };
    
    for (const [name, index] of Object.entries(orders)) {
        await supabaseAdmin.from('subcategories')
            .update({ order_index: index })
            .eq('category_id', 'servicios')
            .eq('name', name);
    }
    console.log("Done.");
}
run();
