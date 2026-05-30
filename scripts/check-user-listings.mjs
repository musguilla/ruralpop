import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const userId = '8e90c5da-b8a2-4bb4-be44-d8c0e025a0a9';
    
    const { data: listings } = await supabase.from('listings').select('id, title, status, created_at').eq('user_id', userId);
    console.log("Listings for this user:", listings);
}
check();
