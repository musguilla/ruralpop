import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: cacheData, error: cacheError } = await supabase.storage
        .from('wpublic')
        .download('admin-insights-cache.json');

    if (cacheError || !cacheData) {
        console.error("Error downloading cache:", cacheError);
        return;
    }

    const insightsStr = await cacheData.text();
    const insights = JSON.parse(insightsStr);
    console.log("Cache top likes:", insights.topLikesListings.slice(0, 10));
}
check();
