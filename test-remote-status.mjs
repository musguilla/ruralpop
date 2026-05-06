import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://zrpucbuvojskcwrhwevv.supabase.co';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qRuIoHNLVeV3zaGW0Q7A-Q_aYdwNLtj';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test-wallet-1778079881541@example.com', // use the user I just created
      password: 'password123'
  });
  
  if (!session?.access_token) {
      console.log("Could not sign in");
      return;
  }

  const apiUrl = 'https://www.ruralpop.com/api/checkout/escrow/wallet-status';
  const res = await fetch(apiUrl, {
      headers: {
          'Authorization': `Bearer ${session.access_token}`
      }
  });
  
  console.log("Status:", res.status);
  console.log("Response JSON:", await res.json());
}

test();
