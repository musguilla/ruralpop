import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data, error } = await supabase.from('listings').select('id, title, image_urls, created_at').eq('user_id', '8d86f5d3-dfde-44b2-b37e-9125aa435987').order('created_at', { ascending: false });
    console.log(JSON.stringify(data, null, 2));
}
main();
