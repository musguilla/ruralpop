require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const realId = '07baa8f5-9968-46c3-b2b3-80eb50c950fa';
    const now = new Date().toISOString();
    
    const { data, error } = await supabase.from('listings').update({
        created_at: now
    }).eq('id', realId).select('id, title, created_at');
    
    if (error) {
        console.error(error);
    } else {
        console.log("Success! Bumped listing to now:");
        console.log(data);
    }
}
run();
