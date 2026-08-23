import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const email = 'test_update_rls@ruralpop.com';
    const usersList = await supabaseAdmin.auth.admin.listUsers();
    const existing = usersList.data.users.find(u => u.email === email);
    if (existing) await supabaseAdmin.auth.admin.deleteUser(existing.id);
    
    await supabaseAdmin.auth.admin.createUser({ email: email, password: 'password123', email_confirm: true });
    
    const supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: signInData } = await supabaseClient.auth.signInWithPassword({ email, password: 'password123' });
    
    const token = signInData.session.access_token;
    const userId = signInData.user.id;
    
    const supabaseUser = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    // Admin inserts a listing for the user with all required fields
    console.log("Inserting test listing...");
    const { data: listingData, error: insertError } = await supabaseAdmin.from('listings').insert({
        user_id: userId,
        title: 'Test Listing',
        price: 10,
        image_urls: [],
        category: 'agricultura',
        condition: 'new',
        location: 'Madrid'
    }).select();
    
    if(insertError) {
        console.log("Insert error:", insertError);
        return;
    }
    
    const listingId = listingData[0].id;
    
    // User tries to UPDATE their own listing
    console.log("Testing UPDATE on listings...");
    const { data: updateData, error: updateError } = await supabaseUser.from('listings').update({
        image_urls: ['http://example.com/image.jpg']
    }).eq('id', listingId).select();
    
    if (updateError) {
        console.error("UPDATE FAILED due to RLS:", updateError);
    } else {
        console.log("UPDATE SUCCEEDED:", updateData);
    }
    
    await supabaseAdmin.auth.admin.deleteUser(userId);
}
main();
