require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: ote } = await supabase.from('users').select('*').eq('email', 'otemarinas@gmail.com');
    console.log("Ote user profile:", ote);

    const { data: irene } = await supabase.from('users').select('*').eq('email', 'irenealonva@gmail.com');
    console.log("Irene user profile:", irene);
}

main();
