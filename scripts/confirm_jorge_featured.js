require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("Using key starting with:", secretKey?.substring(0, 15));
    const supabaseAdmin = createClient(url, secretKey);

    const jorgeEmail = 'jorgedominguezviqueira@gmail.com';
    const { data: users } = await supabaseAdmin.from('users').select('id, name, email').eq('email', jorgeEmail);
    if (!users || users.length === 0) {
        console.error("User not found!");
        return;
    }

    const userId = users[0].id;
    const featuredUntil = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString();

    // Perform full update
    const { data: updated, error } = await supabaseAdmin
        .from('listings')
        .update({
            is_featured: true,
            featured_until: featuredUntil
        })
        .eq('user_id', userId)
        .eq('status', 'active')
        .select('id, title, is_featured, featured_until, status');

    console.log("\n=== CONFIRMATION RESULT ===");
    console.log("Error:", error?.message || "NONE");
    console.log("Updated rows count:", updated?.length);
    console.log(JSON.stringify(updated, null, 2));
}

main();
