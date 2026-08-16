require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const sellerId = "ef194702-30dc-418a-9360-c5da7baba87d"; // María José Marinas

    console.log("=== 1. Test Querying Seller Wallet as ANON / Buyer ===");
    const supabaseAnon = createClient(url, anonKey);
    const { data: anonWallet, error: anonErr } = await supabaseAnon
        .from("professional_wallets")
        .select("stripe_connected_account_id")
        .eq("user_id", sellerId)
        .single();

    console.log("ANON / Buyer query result:");
    console.log("Error:", anonErr?.message);
    console.log("Data:", anonWallet);

    console.log("\n=== 2. Test Querying Seller Wallet as Admin / Service Role ===");
    const supabaseAdmin = createClient(url, serviceKey);
    const { data: adminWallet, error: adminErr } = await supabaseAdmin
        .from("professional_wallets")
        .select("stripe_connected_account_id")
        .eq("user_id", sellerId)
        .single();

    console.log("Admin / Service Role query result:");
    console.log("Error:", adminErr?.message || "NONE");
    console.log("Data:", adminWallet);
}

main();
