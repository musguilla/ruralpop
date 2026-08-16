require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabaseAdmin = createClient(url, secretKey);

    const email = 'manolodeabelendo@gmail.com';
    const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, name, email')
        .eq('email', email);

    console.log("Found user:", users);

    if (users && users.length > 0) {
        const userId = users[0].id;
        const featuredUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        const { data: updated } = await supabaseAdmin
            .from('listings')
            .update({
                status: 'active',
                is_featured: true,
                featured_until: featuredUntil
            })
            .eq('user_id', userId)
            .ilike('title', '%jaula%')
            .select('id, title, status, is_featured, featured_until');

        console.log("Updated listing:", JSON.stringify(updated, null, 2));
    }
}

main();
