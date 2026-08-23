import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data: users } = await supabaseAdmin.from('users').select('*').ilike('email', '%enrique.martinez@grupovailgisa.es%');
    console.log("Users:", users);

    if (users && users.length > 0) {
        for (const user of users) {
            const { data: wallet } = await supabaseAdmin.from('professional_wallets').select('*').eq('user_id', user.id).maybeSingle();
            console.log(`Wallet for ${user.email}:`, wallet);
        }
    }
}
main();
