require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    // SignUp temp user
    const tempEmail = `test_wallet_user_${Date.now()}@equipop.app`;
    const tempPass = "Password123!";
    
    const anonClient = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data: authData, error: signUpErr } = await anonClient.auth.signUp({
        email: tempEmail,
        password: tempPass
    });
    
    if (signUpErr || !authData.session) {
        console.error("SignUp error:", signUpErr);
        return;
    }
    
    const user = authData.user;
    const token = authData.session.access_token;
    console.log("Created user:", user.id);
    
    // Create user-scoped client
    const userClient = createClient(url, anonKey, {
        global: {
            headers: { Authorization: `Bearer ${token}` }
        },
        auth: { persistSession: false }
    });
    
    // Test querying users table for own profile
    const { data: profile, error: pErr } = await userClient
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
    console.log("Profile query result:", { profile: !!profile, error: pErr });
    
    // Test querying professional_wallets for own wallet
    const { data: wallet, error: wErr } = await userClient
        .from('professional_wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
    console.log("Wallet query result:", { wallet, error: wErr });
}

main();
