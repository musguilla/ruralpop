import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data, error } = await supabaseAdmin.storage.from('listings').list();
    console.log("Bucket list error:", error ? error.message : "Success");
    
    // Unfortunately, we can't easily read RLS policies via JS client for storage.
    // Let's do a simple test upload using an anon user.
    
    const { data: users } = await supabaseAdmin.from('users').select('id, email').eq('role', 'user').limit(1);
    if (!users || users.length === 0) return console.log("No user found");
    
    const email = 'test_upload_policy@ruralpop.com';
    const usersList = await supabaseAdmin.auth.admin.listUsers();
    const existing = usersList.data.users.find(u => u.email === email);
    if (existing) await supabaseAdmin.auth.admin.deleteUser(existing.id);
    
    await supabaseAdmin.auth.admin.createUser({ email: email, password: 'password123', email_confirm: true });
    
    const supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: signInData } = await supabaseClient.auth.signInWithPassword({ email, password: 'password123' });
    
    const token = signInData.session.access_token;
    
    const supabaseUser = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    console.log("Testing upload to listings bucket...");
    const { data: uploadData, error: uploadError } = await supabaseUser.storage.from('listings').upload('test/test.txt', 'hello world', { upsert: true });
    
    if (uploadError) {
        console.error("Upload FAILED:", uploadError);
    } else {
        console.log("Upload SUCCEEDED:", uploadData);
    }
    
    await supabaseAdmin.auth.admin.deleteUser(signInData.user.id);
}
main();
