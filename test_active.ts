import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
        
    let activeQuery = supabaseAdmin
        .from('users')
        .select('id, email, last_sign_in_at')
        .gte('last_sign_in_at', todayStart.toISOString());
    const { data, error } = await activeQuery;
    console.log("Data:", data, "Error:", error);
}
main();
