import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: nulls } = await supabase.from('listings').select('id').is('is_featured', null).limit(1);
    console.log('Nulls:', nulls);
    const { data: falses } = await supabase.from('listings').select('id').eq('is_featured', false).limit(1);
    console.log('Falses:', falses);
}
check();
