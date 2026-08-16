require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: user } = await supabase
        .from('users')
        .select('id, email, ghost_token')
        .eq('email', 'jorgedominguezviqueira@gmail.com');

    console.log("Jorge User:", user);
}

main();
