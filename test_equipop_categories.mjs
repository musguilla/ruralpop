import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
    const { data: subData, error: subError } = await supabase.from('subcategories').select('*').eq('category_id', 'sillas-de-montar-y-accesorios');
    if (!subError) {
        console.log("Subcategories for sillas-de-montar-y-accesorios:", subData);
    } else {
        console.error(subError);
    }
}
run();
