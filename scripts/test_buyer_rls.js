require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, adminKey);

    // 1. Get buyer ID from the order
    const buyerId = "b9aee85c-ddd7-41d9-9315-5f77b1338a1b"; // Irene Barquín
    
    // Let's check RLS policies on escrow_orders
    const { data: policies } = await supabaseAdmin.rpc('get_policies', { table_name: 'escrow_orders' });
    console.log("RLS Policies for escrow_orders via raw query:");
    
    const { data: rawPolicies, error } = await supabaseAdmin.from('pg_policies').select('*').eq('tablename', 'escrow_orders');
    if (error) {
        // pg_policies might not be accessible via REST. Let's use direct SQL if we had it, but we can't easily.
        console.log("Could not query pg_policies directly via API.");
    } else {
        console.log(rawPolicies);
    }
}

main();
