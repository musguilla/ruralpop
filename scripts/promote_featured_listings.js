require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);

    const idPotra = "3f02ea75-b494-4960-8df7-62fdd537b397"; // Potra de año
    const idPelibuey = "a8f78fc3-9cd5-4c47-bfbd-3e51e45243cd"; // Carnero Pelibuey puro

    console.log("=== Promoting Potra de año and Carnero Pelibuey to top of Featured Slider ===");

    const now = new Date();
    const nowPotra = now.toISOString();
    const nowPelibuey = new Date(now.getTime() - 1000).toISOString();

    // 1. Update Potra de año
    const { data: data1, error: err1 } = await supabaseAdmin
        .from('listings')
        .update({ 
            is_featured: true,
            created_at: nowPotra 
        })
        .eq('id', idPotra)
        .select('id, title, is_featured, created_at');

    if (err1) console.error("Error updating Potra:", err1);
    else console.log("Updated Potra:", data1);

    // 2. Update Carnero Pelibuey
    const { data: data2, error: err2 } = await supabaseAdmin
        .from('listings')
        .update({ 
            is_featured: true,
            created_at: nowPelibuey 
        })
        .eq('id', idPelibuey)
        .select('id, title, is_featured, created_at');

    if (err2) console.error("Error updating Pelibuey:", err2);
    else console.log("Updated Pelibuey:", data2);

    console.log("\n=== Checking top 5 featured listings in DB ===");
    const { data: featured } = await supabaseAdmin
        .from('listings')
        .select('id, title, created_at, is_featured')
        .eq('status', 'active')
        .eq('is_featured', true)
        .or('tenant_id.eq.ea2490cc-dc33-48f3-bc7b-82b14aa70eb9,tenant_id.is.null')
        .order('created_at', { ascending: false })
        .limit(5);

    console.log(JSON.stringify(featured, null, 2));
}

main();
