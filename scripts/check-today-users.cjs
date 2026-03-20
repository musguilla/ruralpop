const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    
    console.log("Checking users since:", todayStart);
    
    const { data: users, error, count } = await supabase
        .from('users')
        .select('id, created_at, email', { count: 'exact' })
        .gte('created_at', todayStart)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log("Total users registered today:", count);
    console.log("Last 5 users:", users.slice(0, 5));
    
    // Also check last 24 hours
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const { count: count24h } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', last24h);
    
    console.log("Total users registered in last 24h:", count24h);
}

check();
