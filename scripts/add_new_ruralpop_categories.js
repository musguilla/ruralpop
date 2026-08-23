const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
async function addCats() {
    const newCats = [
        { id: 'recambios-maquinaria', name: 'Recambios maquinaria', order_index: 25 },
        { id: 'equipamiento-y-material', name: 'Equipamiento y material', order_index: 26 },
        { id: 'coches', name: 'Coches', order_index: 80 },
        { id: 'atv', name: 'ATV', order_index: 90 },
        { id: 'motos', name: 'Motos', order_index: 100 },
        { id: 'genetica-y-reproduccion', name: 'Genética y reproducción', order_index: 110 }
    ];
    for (const cat of newCats) {
        const { error } = await supabase.from('categories').upsert({ id: cat.id, name: cat.name, order_index: cat.order_index, tenant_id: null });
        if (error) { console.error('Error adding category:', cat.name, error); } 
        else { console.log('Added category:', cat.name); }
    }
}
addCats();
