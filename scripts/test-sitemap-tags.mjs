import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    const { data: listings, error } = await supabase
        .from('listings')
        .select('tags, province_id')
        .eq('status', 'active');
        
    console.log("Listings length:", listings ? listings.length : 0);
    if (error) console.error("Error:", error);
    
    let hasTags = 0;
    for (const l of listings || []) {
        if (l.tags && l.tags.length > 0) hasTags++;
    }
    console.log("Listings with tags:", hasTags);
}
check();
