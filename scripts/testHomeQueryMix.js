require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const locale = 'es';
    const tenantFilterString = `tenant_id.eq.ea2490cc-dc33-48f3-bc7b-82b14aa70eb9,tenant_id.is.null`;
    
    const applyCountryFilter = (q) => {
        if (locale !== 'pt') {
            return q.or(`and(or(province_id.lt.100,province_id.is.null),or(${tenantFilterString}))`);
        } else {
            return q.gte("province_id", 100).or(tenantFilterString);
        }
    };

    let qOthers = supabase
        .from("listings")
        .select(`id, title, subcategory, province_id, tenant_id, created_at, users!inner(is_ghost)`)
        .eq("status", "active")
        .eq("users.is_ghost", false)
        .neq("image_urls", "{}")
        .not("subcategory", "in", `(equino,ovino,caprino,bovino)`)
        .order("created_at", { ascending: false })
        .limit(6);
        
    const r = await applyCountryFilter(qOthers);
    console.log(r.data);
}
run();
