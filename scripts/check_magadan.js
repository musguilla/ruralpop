require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabaseAdmin = createClient(url, secretKey);

    const email = 'magadanjr@gmail.com';
    const { data: users, error: userErr } = await supabaseAdmin
        .from('users')
        .select('id, name, email, created_at')
        .eq('email', email);

    console.log("User check:", userErr?.message || "SUCCESS");
    console.log("Found user:", users);

    if (users && users.length > 0) {
        const { data: listings } = await supabaseAdmin
            .from('listings')
            .select('id, title, status, created_at')
            .eq('user_id', users[0].id);

        console.log("Listings for Jose Ramon:", listings);
    }
}

main();
