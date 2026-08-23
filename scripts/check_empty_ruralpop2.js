import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data, error } = await supabaseAdmin
        .from('listings')
        .select('id, title, image_urls, created_at, users!inner(email, tenant_id)')
        .is('users.tenant_id', null)
        .order('created_at', { ascending: false })
        .limit(30);
        
    const empty = data.filter(l => !l.image_urls || l.image_urls.length === 0);
    console.log("Empty Ruralpop listings:", empty.length, empty.slice(0, 3));
    
    // Check if there are any mobile app listings AT ALL (not media.ruralpop.com)
    const mobile = data.filter(l => l.image_urls && l.image_urls.some(url => url && !url.includes('media.ruralpop.com')));
    console.log("Mobile app Ruralpop listings:", mobile.length, mobile.slice(0, 3));
}
main();
