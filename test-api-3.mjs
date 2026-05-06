import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://zrpucbuvojskcwrhwevv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qRuIoHNLVeV3zaGW0Q7A-Q_aYdwNLtj';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const userId = '00000000-0000-0000-0000-000000000000'; // dummy user

  try {
      let { data: wallet, error } = await supabaseAdmin
          .from("professional_wallets")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

      console.log("Wallet:", wallet);
      console.log("Error:", error);
      
      let accountId = wallet?.stripe_connected_account_id;
      console.log("AccountId:", accountId);
      
  } catch (e) {
      console.log("Caught:", e.message);
  }
}

test();
