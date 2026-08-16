require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabaseAdmin = createClient(url, secretKey);

    const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('id, name, email, created_at')
        .eq('email', 'ing.adriangutierrez@gmail.com');

    console.log("Check result:", error?.message || "SUCCESS");
    console.log("Found users:", users);
}

main();
