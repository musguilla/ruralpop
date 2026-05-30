import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: users } = await supabase.from('users').select('id, name, email').ilike('email', '%ortiztorremarialuisa%');
    console.log("Users with email containing 'ortiztorremarialuisa':", users);
    
    // Also check auth users
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const matches = authUsers?.users?.filter(u => u.email.includes('ortiztorre'));
    console.log("Auth matches:", matches?.map(u => u.email));
}
check();
