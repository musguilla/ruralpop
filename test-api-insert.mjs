import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://zrpucbuvojskcwrhwevv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qRuIoHNLVeV3zaGW0Q7A-Q_aYdwNLtj';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const userId = '00000000-0000-0000-0000-000000000000'; // dummy user
  const accountId = 'acct_12345';

  const { error: insertError } = await supabaseAdmin.from("professional_wallets").insert({
      user_id: userId,
      stripe_connected_account_id: accountId,
  });
  
  console.log("Insert Error:", insertError);
}

test();
