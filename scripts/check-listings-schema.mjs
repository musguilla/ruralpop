import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: cols } = await supabase.rpc('run_sql', { sql_query: "SELECT column_name FROM information_schema.columns WHERE table_name = 'listings';" });
    console.log("Listing columns:", cols);
}
check();
