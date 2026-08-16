require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const emails = ['otemarinas@gmail.com', 'irenealonva@gmail.com'];
    const featuredUntil = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString();

    for (const email of emails) {
        console.log(`\n=== Activating featured for ${email} ===`);
        
        // 1. Get user id
        const { data: users } = await supabase.from('users').select('id').eq('email', email);
        if (!users || users.length === 0) continue;
        
        const userId = users[0].id;
        
        // 2. Update active listings
        const { data: updatedListings, error } = await supabase
            .from('listings')
            .update({
                is_featured: true,
                featured_until: featuredUntil
            })
            .eq('user_id', userId)
            .eq('status', 'active')
            .select('id, title, is_featured, featured_until');

        console.log("Updated listings:", updatedListings, error);
    }
}

main();
