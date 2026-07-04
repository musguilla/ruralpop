const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    let q = supabase.from('listings').select('id, title, category, equipop_category, status, users!inner(is_ghost)');
    q = q.or(`category.eq."sillas-de-montar-y-accesorios",equipop_category.eq."sillas-de-montar-y-accesorios"`);
    q = q.eq("status", "active").eq("users.is_ghost", false);
    
    const { data, error } = await q.limit(5);
    console.log("Error:", error);
    console.log("Data length:", data ? data.length : 0);
    console.log("Data:", data);
}

check();
