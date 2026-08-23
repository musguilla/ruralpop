import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    // Read pg_policies using an RPC if possible? We don't have RPC.
    // Can we run raw SQL? We can't run raw SQL from JS client.
    
    // Let's try to query pg_policies via postgrest if it's in the 'public' schema? No, it's pg_catalog.
    
    // I can just try to upload a file as an Equipop user!
    
    const { data: users } = await supabaseAdmin.from('users').select('id, email').eq('tenant_id', 'ea2490cc-dc33-48f3-bc7b-82b14aa70eb9').limit(1);
    const equipopUser = users[0];
    
    console.log("Found Equipop user:", equipopUser.email);
    
    // I don't have their password, so I will create a dummy equipop user
    const email = 'test_equipop_upload@equipop.com';
    const usersList = await supabaseAdmin.auth.admin.listUsers();
    const existing = usersList.data.users.find(u => u.email === email);
    if (existing) await supabaseAdmin.auth.admin.deleteUser(existing.id);
    
    const { data: authUser } = await supabaseAdmin.auth.admin.createUser({ email: email, password: 'password123', email_confirm: true });
    
    // Set them as Equipop user
    await supabaseAdmin.from('users').update({ tenant_id: 'ea2490cc-dc33-48f3-bc7b-82b14aa70eb9' }).eq('id', authUser.user.id);
    
    const supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: signInData } = await supabaseClient.auth.signInWithPassword({ email, password: 'password123' });
    
    const token = signInData.session.access_token;
    
    const supabaseUser = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    console.log("Testing upload to listings bucket as EQUIPOP user...");
    const { data: uploadData, error: uploadError } = await supabaseUser.storage.from('listings').upload(`test_equipop_${Date.now()}.txt`, 'hello world', { upsert: true });
    
    if (uploadError) {
        console.error("Upload FAILED:", uploadError);
    } else {
        console.log("Upload SUCCEEDED:", uploadData);
    }
    
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
}
main();
