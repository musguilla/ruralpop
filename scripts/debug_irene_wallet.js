require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

async function main() {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        { auth: { persistSession: false } }
    );
    
    // 1. Get user id for irenealonva@gmail.com
    const { data: users, error: uErr } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', 'irenealonva@gmail.com');
        
    console.log("User Data:", users);
    if (!users || users.length === 0) return;
    
    const user = users[0];
    
    // 2. Query professional_wallets
    const { data: wallet, error: wErr } = await supabaseAdmin
        .from('professional_wallets')
        .select('*')
        .eq('user_id', user.id);
        
    console.log("Wallet Data:", wallet, wErr);
}

main();
