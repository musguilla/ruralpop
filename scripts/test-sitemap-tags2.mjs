import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    const { data: listings } = await supabase
        .from('listings')
        .select('province_id')
        .order('province_id', { ascending: true })
        .limit(10);
        
    console.log("Listings lowest province_ids:", listings.map(l => l.province_id));
}
check();
