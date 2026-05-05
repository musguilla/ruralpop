const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function deleteWallet() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'info@musguilla.com')
        .single();

    if (userError || !user) {
        console.error("User not found in public.users:", userError);
        return;
    }

    const { data, error } = await supabase
        .from('professional_wallets')
        .delete()
        .eq('user_id', user.id);

    if (error) {
        console.error("Error deleting wallet:", error);
    } else {
        console.log("Wallet deleted successfully!");
    }
}

deleteWallet();
