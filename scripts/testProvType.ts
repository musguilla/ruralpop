import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data } = await supabase.rpc('query', { sql_query: "SELECT data_type FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'province_id';" });
    console.log(data);
}
run();
