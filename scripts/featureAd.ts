import { decodeId } from '../src/utils/idUtils';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    const shortId = 'EaFVYqNBU9pfnkMB5Md6g';
    const realId = decodeId(shortId);
    console.log("Real ID:", realId);
    
    if (!realId) {
        console.error("Could not decode ID");
        return;
    }
    
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    
    const featuredUntil = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase.from('listings').update({
        is_featured: true,
        featured_until: featuredUntil
    }).eq('id', realId).select('id, title, is_featured, featured_until');
    
    if (error) {
        console.error(error);
    } else {
        console.log("Success! Updated listing:");
        console.log(data);
    }
}
run();
