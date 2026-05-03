import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: cols1 } = await supabase.from('information_schema.columns').select('column_name').eq('table_name', 'listings');
    console.log("Listings columns:", cols1.map(c => c.column_name).sort().join(', '));
    const { data: cols2 } = await supabase.from('information_schema.columns').select('column_name').eq('table_name', 'escrow_orders');
    console.log("Escrow Orders columns:", cols2.map(c => c.column_name).sort().join(', '));
}
run();
