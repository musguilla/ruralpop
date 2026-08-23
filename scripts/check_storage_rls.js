import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data, error } = await supabaseAdmin
        .from('objects') // Actually, it's storage.objects, which might not be exposed to PostgREST
        .select('*')
        .limit(1);
    console.log("Error querying objects:", error);
}
main();
