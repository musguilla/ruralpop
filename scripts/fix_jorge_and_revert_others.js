require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log("=== STEP 1: Reverting Ote & Irene back to non-featured ===");
    const equipopEmails = ['otemarinas@gmail.com', 'irenealonva@gmail.com'];
    for (const email of equipopEmails) {
        const { data: users } = await supabase.from('users').select('id, name').eq('email', email);
        if (!users || users.length === 0) continue;
        const user = users[0];

        const { data, error } = await supabase
            .from('listings')
            .update({
                is_featured: false,
                featured_until: null
            })
            .eq('user_id', user.id);

        console.log(`Reverted ${user.name} (${email}):`, error?.message || "SUCCESS");
    }

    console.log("\n=== STEP 2: Activating 20 days featured for Jorge (jorgedominguezviqueira@gmail.com) ===");
    const jorgeEmail = 'jorgedominguezviqueira@gmail.com';
    const { data: jorgeUsers } = await supabase.from('users').select('id, name').eq('email', jorgeEmail);
    
    if (!jorgeUsers || jorgeUsers.length === 0) {
        console.error("User jorgedominguezviqueira@gmail.com not found!");
        return;
    }

    const jorgeId = jorgeUsers[0].id;
    console.log(`Found Jorge ID: ${jorgeId}`);

    const featuredUntil = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString();

    const { data: jorgeListings } = await supabase
        .from('listings')
        .select('id, title, is_featured')
        .eq('user_id', jorgeId)
        .eq('status', 'active');

    console.log(`Found ${jorgeListings?.length} active listings for Jorge:`);

    if (jorgeListings) {
        for (const l of jorgeListings) {
            const { error } = await supabase
                .from('listings')
                .update({
                    is_featured: true,
                    featured_until: featuredUntil
                })
                .eq('id', l.id);

            console.log(`  - Activated [${l.id}] "${l.title}" => Featured until ${featuredUntil} (Err: ${error?.message || 'None'})`);
        }
    }
}

main();
