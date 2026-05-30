import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: users } = await supabase.from('users').select('id, name, email').ilike('name', '%marialuisa%');
    console.log("Users by name 'marialuisa':", users);
    
    const { data: users2 } = await supabase.from('users').select('id, name, email').ilike('name', '%maria luisa%');
    console.log("Users by name 'maria luisa':", users2);
    
    const { data: users3 } = await supabase.from('users').select('id, name, email').ilike('email', '%ortiztorre%');
    console.log("Users by email 'ortiztorre':", users3);
}
check();
