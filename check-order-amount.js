require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data: order } = await supabase.from('escrow_orders').select('seller_net_amount_cents').eq('id', '75f25683-26b7-4285-aef3-8f2688e68f67').single();
    console.log("Seller Net Amount:", order.seller_net_amount_cents / 100, "EUR");
}
check();
