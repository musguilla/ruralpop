import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://zrpucbuvojskcwrhwevv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qRuIoHNLVeV3zaGW0Q7A-Q_aYdwNLtj';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  // Let's query a non-existent user ID
  const { data: wallet, error } = await supabase
      .from("professional_wallets")
      .select("*")
      .eq("user_id", "00000000-0000-0000-0000-000000000000")
      .single();
      
  console.log("Error:", error);
}

test();
