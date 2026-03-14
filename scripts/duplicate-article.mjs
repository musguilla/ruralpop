import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: posts, error: fetchError } = await supabase
        .from('magazine_posts')
        .select('*')
        .eq('title', 'Vacapop cierra: la app desaparece y elimina todos sus anuncios');

    if (fetchError || !posts || posts.length === 0) {
        console.error('Error fetching post:', fetchError || 'No posts found');
        return;
    }

    const postToDuplicate = posts[0];

    // Create new post with older date
    const newPost = {
        ...postToDuplicate,
        id: crypto.randomUUID(), // Let db generate new id -> generate UUID in node
        title: 'Vacapop app',
        slug: 'vacapop-app',
        // Make it the oldest by setting published_at to a year earlier than the oldest post
        published_at: new Date('2020-01-01').toISOString(),
    };

    const { error: insertError } = await supabase
        .from('magazine_posts')
        .insert([newPost]);

    if (insertError) {
        console.error('Error inserting post:', insertError);
    } else {
        console.log('Successfully duplicated post as "Vacapop app"');
    }
}

run();
