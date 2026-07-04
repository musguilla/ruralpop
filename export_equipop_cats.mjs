import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
    const { data: catData } = await supabase.from('categories').select('*').eq('tenant_id', '69d55371-2f70-4e67-b55c-4502bce305bb').order('order_index');
    const { data: subData } = await supabase.from('subcategories').select('*').eq('tenant_id', '69d55371-2f70-4e67-b55c-4502bce305bb').order('order_index');
    
    const result = catData.map(cat => {
        const subs = subData.filter(s => s.category_id === cat.id).map(s => s.name);
        return {
            id: cat.id,
            label: cat.name,
            subcategories: subs
        };
    });
    fs.writeFileSync('equipop_cats.json', JSON.stringify(result, null, 4));
    console.log('Done writing equipop_cats.json');
}
run();
