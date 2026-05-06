import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://zrpucbuvojskcwrhwevv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qRuIoHNLVeV3zaGW0Q7A-Q_aYdwNLtj';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data } = await supabaseAdmin.from("professional_wallets").select("*").limit(1);
  console.log("Wallet schema:", data ? Object.keys(data[0]) : "no data");
}

test();
