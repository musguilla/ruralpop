import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { error } = await supabase.from('listings').update({status: 'active_pt'}).eq('id', '0e52efde-7bd6-4d99-abbe-f86f62c1b2da');
    console.log(error);
}
run();
