import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const email = 'ortiztorremarialuisa729@gmail.com';
    
    // Check Auth Users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) console.error("Auth error:", authError);
    const authUser = authUsers?.users?.find(u => u.email === email);
    
    console.log("Auth User:", authUser ? { id: authUser.id, email: authUser.email, email_confirmed_at: authUser.email_confirmed_at, banned_until: authUser.banned_until } : "Not found in Auth");

    // Check Public Users profile
    if (authUser) {
        const { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).single();
        console.log("Public Profile:", profile);
        
        // Check Listings
        const { data: listings } = await supabase.from('listings').select('id, title, status, created_at, is_featured, reject_reason').eq('user_id', authUser.id);
        console.log("Listings:", listings);
    } else {
        // Maybe check by email in public users if auth user is not found
        const { data: profile } = await supabase.from('users').select('*').eq('email', email);
        console.log("Public Profile (searched by email):", profile);
    }
}
check();
