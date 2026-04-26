import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    let { data, error } = await supabaseAdmin.from('products').select('slug, description').eq('slug', 'gorra-acid-bull').single();
    console.log(data);
}
run();
