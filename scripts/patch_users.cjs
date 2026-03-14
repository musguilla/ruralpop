const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function patchUsers() {
    const { data: usersData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) {
        console.error("Auth error:", authError);
        return;
    }

    let updatedCount = 0;

    for (const authUser of usersData.users) {
        const meta = authUser.user_metadata || {};
        const metaName = meta.name || meta.full_name || meta.user_name;

        if (metaName) {
            // Check public.users
            const { data: publicUser } = await supabaseAdmin
                .from('users')
                .select('name')
                .eq('id', authUser.id)
                .single();

            if (publicUser && !publicUser.name) {
                console.log(`Patching user ${authUser.email} with name ${metaName}`);
                await supabaseAdmin
                    .from('users')
                    .update({ name: metaName })
                    .eq('id', authUser.id);
                updatedCount++;
            }
        }
    }
    console.log(`Successfully patched ${updatedCount} users.`);
}

patchUsers();
