import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    let query = supabase
        .from("listings")
        .select(`id, title, province_id, users!inner(is_ghost)`)
        .eq("status", "active")
        .eq("users.is_ghost", false)
        .order("created_at", { ascending: false })
        .limit(10);
        
    query = query.or("province_id.lt.100,province_id.is.null");
    
    // Using ruralpop tenant string since that's what the app is
    const ruralpopId = 'ea2490cc-dc33-48f3-bc7b-82b14aa70eb9';
    const tenantFilterString = `tenant_id.eq.${ruralpopId},tenant_id.is.null`;
    
    query = query.or(tenantFilterString);
    
    const { data, error } = await query;
    console.log("Returned ads:", data?.map(d => ({title: d.title, prov: d.province_id})));
    if (error) console.log("Error:", error);
}
run();
