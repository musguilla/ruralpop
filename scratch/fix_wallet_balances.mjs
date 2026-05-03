import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: wallets } = await supabaseAdmin.from('professional_wallets').select('*');
    for (const wallet of wallets) {
        // Find all orders for this user
        const { data: orders } = await supabaseAdmin.from('escrow_orders').select('*').eq('seller_id', wallet.user_id);
        
        let pending = 0;
        let available = 0;
        let total = 0;

        for (const order of orders || []) {
            if (['paid_held', 'buyer_confirmed', 'return_initiated'].includes(order.status)) {
                pending += order.seller_net_amount_cents;
            } else if (order.status === 'paid_out') {
                available += order.seller_net_amount_cents;
                total += order.seller_net_amount_cents;
            }
        }

        console.log(`Fixing wallet for user ${wallet.user_id}: Pending: ${pending}, Available: ${available}`);
        await supabaseAdmin.from('professional_wallets').update({
            pending_balance_cents: pending,
            available_balance_cents: available,
            total_earned_cents: total
        }).eq('id', wallet.id);
    }
}
run();
