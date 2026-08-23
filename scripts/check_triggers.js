import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data, error } = await supabaseAdmin.rpc('get_pg_triggers');
    if (error) {
        console.log("RPC get_pg_triggers failed:", error);
        
        // Let's run a raw query via postgrest if we can't use RPC
        const { data: rawData, error: rawError } = await supabaseAdmin
            .from('pg_trigger')
            .select('*')
            .limit(10);
            
        console.log("Raw query error:", rawError);
    } else {
        console.log("Triggers:", data);
    }
}
main();
