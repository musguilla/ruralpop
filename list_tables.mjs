import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zrpucbuvojskcwrhwevv.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_zo6E6YvBYltAqRmLbmGOiA_zk3Xrt9U'
);

async function test() {
    // try to read some tables to see what's available
    const tables = ['settings', 'config', 'app_config', 'system_config', 'site_config', 'key_value'];
    
    for (const table of tables) {
        const { data, error } = await supabaseAdmin.from(table).select('*').limit(1);
        if (!error) {
            console.log("Table exists:", table);
        }
    }
}
test();
