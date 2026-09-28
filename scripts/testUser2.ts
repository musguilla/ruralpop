import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data, error } = await supabase.from('users').select('id, is_ghost, name').eq('id', '689db279-a64b-411b-b654-f6146238d49d');
    console.log(data);
}
run();
