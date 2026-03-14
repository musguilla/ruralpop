import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { error } = await supabase
        .from('magazine_posts')
        .update({ published_at: new Date('2026-02-28T00:00:00Z').toISOString() })
        .eq('slug', 'vacapop-app');

    if (error) {
        console.error('Error updating post date:', error);
    } else {
        console.log('Successfully updated published_at to 28/02/2026 for "vacapop-app"');
    }
}

run();
