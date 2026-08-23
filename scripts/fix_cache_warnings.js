import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const emptyCache = {
        topLikesListings: []
    };

    const { data, error } = await supabaseAdmin.storage
        .from('wpublic')
        .upload('admin-insights-cache-equipop.json', JSON.stringify(emptyCache), {
            contentType: 'application/json',
            upsert: true
        });

    console.log("Upload result:", data, error);
}
main();
