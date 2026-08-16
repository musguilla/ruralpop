require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabaseAdmin = createClient(url, secretKey);

    console.log("=== 1. Searching for Veredus Listing ===");
    const { data: listings, error } = await supabaseAdmin
        .from('listings')
        .select('*')
        .ilike('title', '%Protectores%Veredus%');

    console.log("Search error:", error?.message || "SUCCESS");
    console.log("Listings found:", listings?.length);
    console.log(JSON.stringify(listings, null, 2));

    if (listings && listings.length > 0) {
        const sellerId = listings[0].user_id;
        console.log(`\n=== 2. Checking Seller User Profile (${sellerId}) ===`);
        const { data: seller } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', sellerId)
            .single();

        console.log("Seller profile:", JSON.stringify(seller, null, 2));

        console.log(`\n=== 3. Checking Seller Professional Wallet (${sellerId}) ===`);
        const { data: wallet } = await supabaseAdmin
            .from('professional_wallets')
            .select('*')
            .eq('user_id', sellerId);

        console.log("Seller wallet:", JSON.stringify(wallet, null, 2));
    }
}

main();
