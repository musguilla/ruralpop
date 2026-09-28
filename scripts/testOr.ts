import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    let query = supabase.from("listings").select('id, title, province_id').order('created_at', {ascending: false}).limit(10);
    query = query.or("province_id.lt.100,province_id.is.null");
    
    const ruralpopId = 'ea2490cc-dc33-48f3-bc7b-82b14aa70eb9';
    query = query.or(`tenant_id.eq.${ruralpopId},tenant_id.is.null`);
    
    const { data } = await query;
    console.log("Returned provs:", data.map(d => d.province_id));
}
run();
