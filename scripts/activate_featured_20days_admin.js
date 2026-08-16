require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    // We can use createClient with anon key or service role key with db headers
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const userIds = ['ef194702-30dc-418a-9360-c5da7baba87d', 'cacbfea3-472e-415b-b6e2-c1683b9c9d39'];
    const featuredUntil = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString();

    for (const userId of userIds) {
        console.log(`\n=== Processing User ${userId} ===`);
        
        // Get active listings
        const { data: listings } = await supabase
            .from('listings')
            .select('id, title, status')
            .eq('user_id', userId)
            .eq('status', 'active');

        console.log(`Found ${listings?.length} active listings:`);
        if (listings) {
            for (const l of listings) {
                console.log(`- [${l.id}] ${l.title}`);
            }
        }
    }
}

main();
