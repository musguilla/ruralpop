import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

async function main() {
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: users } = await supabaseAdmin.from('users').select('id, email').eq('role', 'user').limit(1);
    const user = users[0];

    const email = 'test_rls_wallet2@ruralpop.com';
    const existing = (await supabaseAdmin.auth.admin.listUsers()).data.users.find(u => u.email === email);
    if (existing) await supabaseAdmin.auth.admin.deleteUser(existing.id);
    
    await supabaseAdmin.auth.admin.createUser({ email: email, password: 'password123', email_confirm: true });
    
    const supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: signInData } = await supabaseClient.auth.signInWithPassword({ email, password: 'password123' });
    
    const token = signInData.session.access_token;
    const userId = signInData.user.id;
    
    const supabaseUser = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    // Add a wallet as admin
    await supabaseAdmin.from('professional_wallets').insert({ user_id: userId, stripe_connected_account_id: 'acct_test' });

    console.log("Testing SELECT from professional_wallets...");
    const { data: selectData, error: selectError } = await supabaseUser.from('professional_wallets').select('*').eq('user_id', userId).maybeSingle();
    
    if (selectError) {
        console.error("SELECT FAILED:", selectError);
    } else {
        console.log("SELECT SUCCEEDED:", selectData);
    }
    
    await supabaseAdmin.auth.admin.deleteUser(userId);
}
main();
