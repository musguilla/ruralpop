require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
async function main() {
    // Need a user token! I can create a fake user or just sign in as a user I know.
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Create a temporary user
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: 'test_upload_rls@ruralpop.com',
        password: 'password123',
        email_confirm: true
    });
    
    if (userError) {
        console.log("Failed to create user", userError);
        return;
    }
    
    // Now sign in
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'test_upload_rls@ruralpop.com',
        password: 'password123'
    });
    
    if (loginError) {
        console.log("Login failed", loginError);
        return;
    }
    
    const buffer = Buffer.from('test');
    const { data, error } = await supabase.storage.from('listings').upload('test_upload_rls.jpg', buffer, { upsert: true });
    
    console.log("Upload result:", data || error);
    
    // Clean up
    await supabaseAdmin.auth.admin.deleteUser(user.user.id);
}
main();
