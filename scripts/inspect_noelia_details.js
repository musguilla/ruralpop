require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);

    const noeliaId = "8e796efc-2bdc-4fcc-93b1-b08fe5baeec3";

    console.log("=== All Escrow Orders for Noelia ===");
    const { data: orders } = await supabaseAdmin
        .from('escrow_orders')
        .select(`
            *,
            listing:listing_id ( id, title, price, status )
        `)
        .eq('buyer_id', noeliaId);

    console.log("Noelia orders count:", orders?.length);
    console.log(JSON.stringify(orders, null, 2));

    console.log("\n=== Checking conversations involving Noelia ===");
    const { data: convs } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .or(`participant1_id.eq.${noeliaId},participant2_id.eq.${noeliaId}`);

    console.log("Conversations found:", convs?.length);
    console.log(JSON.stringify(convs, null, 2));
}

main();
