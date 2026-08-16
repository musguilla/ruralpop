require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Let's try signing in
    const res = await supabase.auth.signInWithPassword({
        email: 'info@musguilla.com',
        password: 'admin' // test
    });

    console.log("Sign in result:", res.error?.message || "SUCCESS!");
}

main();
