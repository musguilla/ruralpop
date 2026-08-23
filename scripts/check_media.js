import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data, error } = await supabase.from('listings').select('id, title, image_urls, media').order('created_at', { ascending: false }).limit(5);
    console.log(JSON.stringify(data, null, 2));
}
main();
