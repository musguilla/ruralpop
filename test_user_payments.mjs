import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase.from('listings').select('*').eq('id', '64498e47-94a4-463e-89e1-0dffd7d74334').single();
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Listing keys:", Object.keys(data));
        console.log("Listing data:", data);
    }
}
check();
