require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data, error } = await supabaseAdmin
        .from('professional_wallets')
        .select('*')
        .limit(1);
        
    console.log("Result using SUPABASE_SERVICE_ROLE_KEY:", { data, error });
}

main();
