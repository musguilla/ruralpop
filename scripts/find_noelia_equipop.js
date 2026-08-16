require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);

    console.log("=== 1. Searching users table for Noelia ===");
    const { data: users, error: uErr } = await supabaseAdmin
        .from('users')
        .select('*')
        .or('email.ilike.%noelia%,name.ilike.%noelia%,name.ilike.%casariego%');

    console.log("Users found:", users?.length);
    console.log(JSON.stringify(users, null, 2));

    console.log("\n=== 2. Searching escrow_orders for any order around August / July ===");
    const { data: allOrders, error: oErr } = await supabaseAdmin
        .from('escrow_orders')
        .select(`
            *,
            listing:listing_id ( id, title, price, tenant_id ),
            buyer:buyer_id ( id, name, email ),
            seller:seller_id ( id, name, email )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

    console.log(`Total orders fetched: ${allOrders?.length}`);

    if (users && users.length > 0) {
        const userIds = users.map(u => u.id);
        const matchingOrders = allOrders.filter(o => userIds.includes(o.buyer_id) || userIds.includes(o.seller_id));
        console.log("Matching orders for Noelia:", JSON.stringify(matchingOrders, null, 2));
    }

    console.log("\n=== 3. Searching conversations / messages for Noelia ===");
    const { data: conversations } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(20);

    console.log("Recent conversations count:", conversations?.length);
}

main();
