require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: admins } = await supabase
        .from('users')
        .select('id, email, name, role')
        .eq('role', 'admin');

    console.log("Admins:", admins);
}

main();
