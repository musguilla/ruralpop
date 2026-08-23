import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data, error } = await supabaseAdmin
        .from('listings')
        .select('id, title, image_urls, created_at, user_id, users!inner(email, tenant_id)')
        .is('users.tenant_id', null)
        .order('created_at', { ascending: false })
        .limit(10);
        
    console.log("Recent Ruralpop listings:", JSON.stringify(data, null, 2));
}
main();
