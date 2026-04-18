import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/luis/Personal/__RURALPOP/ruralpopv1/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.log("No auth keys");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase
        .from('listings')
        .select(`
            id, 
            title, 
            created_at, 
            image_urls,
            user_id,
            users:user_id (id, full_name, email, raw_user_meta_data)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error", error);
        return;
    }

    const noImages = data.filter(d => !d.image_urls || d.image_urls.length === 0);
    
    console.log(`Out of the last 20 listings, ${noImages.length} have NO images.`);
    noImages.forEach(item => {
        console.log(`\n- ${item.title}`);
        console.log(`  User ID: ${item.user_id}`);
        console.log(`  User Email: ${item.users?.email}`);
        console.log(`  User Name: ${item.users?.full_name}`);
        console.log(`  Meta: ${JSON.stringify(item.users?.raw_user_meta_data || {})}`);
    });
}
run();
