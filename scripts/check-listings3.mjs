import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/luis/Personal/__RURALPOP/ruralpopv1/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase
        .from('listings')
        .select(`id, title, created_at, image_urls, user_id, status`)
        .order('created_at', { ascending: false })
        .limit(20);

    const noImages = data.filter(d => !d.image_urls || d.image_urls.length === 0);
    
    console.log(`Out of the last 20 listings, ${noImages.length} have NO images.`);
    noImages.forEach(item => {
        console.log(`\n- ${item.title}`);
        console.log(`  User ID: ${item.user_id}`);
        console.log(`  Created: ${new Date(item.created_at).toLocaleString()}`);
    });

    if (noImages.length > 0) {
        // fetch that user
        const { data: userData } = await supabase.from('users').select('*').eq('id', noImages[0].user_id).single();
        console.log("\nSample User that posted these:", JSON.stringify(userData, null, 2));
    }
}
run();
