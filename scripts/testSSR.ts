import { createServerClient } from "@supabase/ssr";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, { cookies: { getAll: () => [], setAll: () => {} } });
    
    let query = supabase.from("listings").select('id, title, province_id').limit(10);
    query = query.or("province_id.lt.100,province_id.is.null");
    query = query.or("tenant_id.is.null");
    
    const { data } = await query;
    console.log("Returned:", data.map(d => d.province_id));
}
run();
