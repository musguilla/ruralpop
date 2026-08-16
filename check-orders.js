require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    // 1. Get user by email
    const { data: users } = await supabase.from('users').select('id, email').eq('email', 'irenealonva@gmail.com');
    if (!users || users.length === 0) {
        console.log("No user found.");
        return;
    }
    const user = users[0];
    
    // 2. Get wallet
    const { data: wallet } = await supabase.from('professional_wallets').select('stripe_account_id').eq('user_id', user.id).single();
    console.log("Wallet Stripe Account ID:", wallet?.stripe_account_id);

    // 3. Get escrow orders where she is seller
    const { data: orders } = await supabase.from('escrow_orders').select('id, status, stripe_connected_account_id').eq('seller_id', user.id);
    console.log("Escrow Orders:", orders);
}
check();
