import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data, error } = await supabaseAdmin.rpc('get_table_info', { table_name: 'listings' });
    console.log("RPC Error:", error);
    
    // If no RPC, let's try reading information_schema via postgrest if exposed.
    // It's probably not exposed.
}
main();
