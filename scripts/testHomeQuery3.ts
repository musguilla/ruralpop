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
    
    // Test if tenant is null
    query = query.or("tenant_id.is.null");
    
    const { data } = await query;
    console.log("Returned provs:", data.map(d => ({title: d.title, p: d.province_id})));
}
run();
