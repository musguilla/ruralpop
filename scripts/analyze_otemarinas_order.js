require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);

    console.log("=== Searching for order: Protectores Delanteros Veredus Olympus ===");
    
    // First find the seller user ID
    const { data: seller } = await supabaseAdmin
        .from('users')
        .select('id, email, name')
        .eq('email', 'otemarinas@gmail.com')
        .single();
        
    if (!seller) {
        console.log("Seller otemarinas@gmail.com not found!");
        return;
    }
    
    console.log("Seller:", seller);

    // Find the escrow order
    const { data: orders, error } = await supabaseAdmin
        .from('escrow_orders')
        .select(`
            *,
            listing:listing_id ( id, title, price, status ),
            buyer:buyer_id ( id, name, email )
        `)
        .eq('seller_id', seller.id)
        .ilike('listing.title', '%Veredus Olympus%');

    if (error) {
        console.error("Error fetching orders:", error);
        return;
    }

    // Filter out null listings (inner join effect workaround since we used left join syntax with ilike)
    const validOrders = orders.filter(o => o.listing !== null);

    console.log(`\nFound ${validOrders.length} matching orders.`);
    
    if (validOrders.length > 0) {
        console.log("\nOrder Details:");
        console.log(JSON.stringify(validOrders[0], null, 2));
    }
}

main();
