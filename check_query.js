const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function check() {
    let query = supabase
        .from("listings")
        .select("*, seller:users(*), favorites(count)", { count: "exact" })
        .or('tenant_id.eq.ea2490cc-dc33-48f3-bc7b-82b14aa70eb9,tenant_id.is.null')
        .order("created_at", { ascending: false })
        .range(0, 39)
        .eq('status', 'draft');

    const { data, error, count } = await query;
    if (error) console.error("Error:", error);
    else console.log("Data length:", data.length, "Count:", count, data.map(d => d.title));
}
check();
