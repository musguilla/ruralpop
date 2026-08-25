import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
async function run() {
    const { data: cats } = await supabase.from('categories').select('*').order('order_index');
    console.log("Camiones:", cats?.find(c => c.id === 'camiones-y-furgonetas'));

    const { data: subcats } = await supabase.from('subcategories').select('*');
    console.log("Subcats in maquinaria:", subcats?.filter(s => s.category_id === 'maquinaria'));
    console.log("Subcats in equipamiento-y-material:", subcats?.filter(s => s.category_id === 'equipamiento-y-material'));
}
run();
