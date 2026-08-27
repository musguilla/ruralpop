import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
async function run() {
    const { error } = await supabase.rpc('create_favorite_profiles_table', {});
    if (error && error.message.includes('Could not find the function')) {
        console.log("No RPC, using raw SQL via another method or I'll just write it.");
    }
}
run();
