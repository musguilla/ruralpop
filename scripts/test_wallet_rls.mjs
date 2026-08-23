import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    // Proceed directly to creating test user

    const email = 'test_rls_wallet@ruralpop.com';
    const usersList = await supabaseAdmin.auth.admin.listUsers();
    const existing = usersList.data.users.find(u => u.email === email);
    if (existing) {
        await supabaseAdmin.auth.admin.deleteUser(existing.id);
    }
    
    const { data: { user: newAuthUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: 'password123',
        email_confirm: true
    });
    
    if (createError) return console.error("Error creating user", createError);
    
    const supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
        email,
        password: 'password123'
    });
    
    if (signInError) return console.error("SignIn error", signInError);
    
    const token = signInData.session.access_token;
    const userId = signInData.user.id;
    
    const supabaseUser = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    console.log("Testing INSERT into professional_wallets...");
    const { data: insertData, error: insertError } = await supabaseUser.from('professional_wallets').insert({
        user_id: userId,
        stripe_connected_account_id: 'acct_test123'
    }).select();
    
    if (insertError) {
        console.error("INSERT FAILED due to RLS:", insertError);
    } else {
        console.log("INSERT SUCCEEDED:", insertData);
        console.log("Testing UPDATE into professional_wallets...");
        const { data: updateData, error: updateError } = await supabaseUser.from('professional_wallets').update({
            stripe_connected_account_id: 'acct_test456'
        }).eq('id', insertData[0].id).select();
        
        if (updateError) {
            console.error("UPDATE FAILED due to RLS:", updateError);
        } else {
            console.log("UPDATE SUCCEEDED:", updateData);
        }
    }
    
    await supabaseAdmin.auth.admin.deleteUser(userId);
}
main();
