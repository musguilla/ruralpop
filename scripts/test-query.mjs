import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    console.log("Testing De Heus listings...");
    
    // Get De Heus ID
    const { data: company, error: companyError } = await supabase
        .from('users')
        .select('id, commercial_name, is_ghost')
        .ilike('commercial_name', '%de heus%')
        .limit(1)
        .single();
        
    if (!company) {
        console.error("De heus Not found");
        return;
    }
    
    console.log("Company:", company);

    let query = supabase
        .from("listings")
        .select(`
            id, title, status,
            users!inner(is_ghost)
        `, { count: "exact" })
        .eq("user_id", company.id)
        .order("created_at", { ascending: false });

    const { data, error, count } = await query;
    console.log("Listings Data:", data);
    console.log("Listings Error:", error);
    console.log("Total Count:", count);
}

test();
