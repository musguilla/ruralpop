require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabaseAdmin = createClient(url, secretKey);

    const email = 'victorlopezsantander@gmail.com';
    console.log("=== 1. Checking User Profile for Victor ===");
    const { data: users, error: userErr } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email);

    console.log("User query:", userErr?.message || "SUCCESS");
    console.log(JSON.stringify(users, null, 2));

    if (users && users.length > 0) {
        const userId = users[0].id;

        console.log("\n=== 2. Checking Listings for Victor ===");
        const { data: listings, error: listErr } = await supabaseAdmin
            .from('listings')
            .select('*')
            .eq('user_id', userId);

        console.log("Listings count:", listings?.length);
        console.log(JSON.stringify(listings, null, 2));
    }
}

main();
