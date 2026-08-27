import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
async function run() {
    const { data, error } = await supabase.from('favorites').select('*').limit(1);
    console.log("Favorites schema:", data && data.length > 0 ? Object.keys(data[0]) : "Empty", error);
}
run();
