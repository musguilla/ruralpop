import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
    const { data } = await supabase.rpc('query', { sql_query: "SELECT relrowsecurity FROM pg_class WHERE relname = 'listings';" });
    console.log(data);
}
run();
