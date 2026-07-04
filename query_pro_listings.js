const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findListings() {
    
    // First find users who have a zoo_register_number
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, name, commercial_name, zoo_register_number')
        .not('zoo_register_number', 'is', null);
        
    const userIds = users ? users.map(u => u.id) : [];
    
    // Let's get the 10 most recent listings from these users
    if (userIds.length > 0) {
        const { data: listings } = await supabase
            .from('listings')
            .select('id, title, created_at, user_id, status, tenant_id')
            .in('user_id', userIds)
            .order('created_at', { ascending: false })
            .limit(10);
            
        console.log(`Found ${listings?.length || 0} recent listings from users with reg numbers:`);
        for (const listing of (listings || [])) {
            const user = users.find(u => u.id === listing.user_id);
            console.log(`- Title: ${listing.title} (Created: ${listing.created_at}) by ${user.name}`);
        }
    }
    
    // Also check if any listings have the welfare_validated tag recently
    const { data: taggedListings } = await supabase
        .from('listings')
        .select('id, title, created_at, user_id, status, tenant_id, tags')
        .contains('tags', ['welfare_validated'])
        .order('created_at', { ascending: false })
        .limit(10);
        
    console.log(`\nFound ${taggedListings?.length || 0} recent listings with welfare_validated tag:`);
    for (const listing of (taggedListings || [])) {
        console.log(`- Title: ${listing.title} (Created: ${listing.created_at})`);
    }
}

findListings();
