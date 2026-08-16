require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const featuredUntil = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString();

    const res = await supabase
        .from('listings')
        .update({
            is_featured: true,
            featured_until: featuredUntil
        })
        .eq('user_id', 'ef194702-30dc-418a-9360-c5da7baba87d')
        .eq('status', 'active');

    console.log("Update result:", res);
}

main();
