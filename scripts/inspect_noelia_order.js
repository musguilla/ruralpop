require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);

    console.log("=== 1. Searching User Profile for noeliakora22@gmail.com ===");
    const { data: user, error: userErr } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', 'noeliakora22@gmail.com')
        .maybeSingle();

    console.log("User:", JSON.stringify(user, null, 2));

    let buyerId = user?.id;

    console.log("\n=== 2. Searching Escrow Orders for Buyer ===");
    let query = supabaseAdmin.from('escrow_orders').select(`
        *,
        listing:listing_id ( id, title, price, image_urls, status, user_id ),
        buyer:buyer_id ( id, name, email ),
        seller:seller_id ( id, name, email, contact_phone )
    `);

    if (buyerId) {
        query = query.or(`buyer_id.eq.${buyerId},seller_email.eq.noeliakora22@gmail.com`);
    } else {
        query = query.eq('seller_email', 'noeliakora22@gmail.com');
    }

    const { data: orders, error: ordersErr } = await query;

    console.log("Orders found:", orders?.length);
    console.log(JSON.stringify(orders, null, 2));

    console.log("\n=== 3. Searching ALL Recent Escrow Orders (Last 20) ===");
    const { data: recentOrders } = await supabaseAdmin
        .from('escrow_orders')
        .select(`
            id, created_at, status, gross_amount_cents, seller_net_amount_cents,
            buyer_id, seller_id, seller_email,
            listing:listing_id ( title ),
            buyer:buyer_id ( name, email ),
            seller:seller_id ( name, email )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

    console.log(JSON.stringify(recentOrders, null, 2));
}

main();
