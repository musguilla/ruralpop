require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const res = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: 'otemarinas@gmail.com'
    });

    console.log("Generate link result:", res);
}

main();
