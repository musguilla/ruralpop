import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listWallets() {
    const { data: wallets } = await supabase.from('professional_wallets').select('id, user_id, stripe_connected_account_id');
    console.log("Wallets encontradas:", wallets.length);
    for (let w of wallets) {
        const { data: user } = await supabase.auth.admin.getUserById(w.user_id);
        console.log(`- Wallet ${w.id} | Usuario: ${user?.user?.email} | Stripe ID: ${w.stripe_connected_account_id}`);
        
        // Delete it
        await supabase.from('professional_wallets').delete().eq('id', w.id);
        console.log(`Wallet ${w.id} eliminada.`);
    }
}

listWallets();
