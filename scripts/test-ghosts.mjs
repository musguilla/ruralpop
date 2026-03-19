import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    const { data, error } = await supabase
        .from('users')
        .select('id, commercial_name, ghost_token, is_ghost, email')
        .order('created_at', { ascending: false });

    console.log("All users:");
    data.forEach(u => console.log(u.commercial_name, u.is_ghost, u.email));
}

test();
