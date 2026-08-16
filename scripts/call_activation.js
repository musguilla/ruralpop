require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    console.log("=== Activating Featured Status for Ote & Irene ===");
    
    // We can update directly via rest using admin account or anon client with service role headers
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const emails = ['otemarinas@gmail.com', 'irenealonva@gmail.com'];
    const featuredUntil = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString();

    for (const email of emails) {
        const { data: users } = await supabase.from('users').select('id, name').eq('email', email);
        if (!users || users.length === 0) continue;
        const user = users[0];

        // Fetch active listing IDs
        const { data: listings } = await supabase
            .from('listings')
            .select('id, title')
            .eq('user_id', user.id)
            .eq('status', 'active');

        console.log(`\nUser: ${user.name} (${email}) - ${listings?.length} active listings:`);
        
        if (listings) {
            for (const l of listings) {
                // Call update on each listing
                const { error } = await supabase
                    .from('listings')
                    .update({
                        is_featured: true,
                        featured_until: featuredUntil
                    })
                    .eq('id', l.id);

                console.log(`  - [${l.id}] ${l.title} => Featured until ${featuredUntil} (Err: ${error?.message || 'None'})`);
            }
        }
    }
}

main();
