import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: cols } = await supabase.from('escrow_orders').select('*').limit(1);
    if(cols && cols.length > 0) {
        console.log("Columns:", Object.keys(cols[0]));
    } else {
        console.log("No data found.");
    }
}
run();
