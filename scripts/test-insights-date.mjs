import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: cacheData } = await supabase.storage
        .from('wpublic')
        .download('admin-insights-cache.json');
    if (cacheData) {
        const insightsStr = await cacheData.text();
        const insights = JSON.parse(insightsStr);
        console.log("Last updated:", insights.last_updated);
    }
}
check();
