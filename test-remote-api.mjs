import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://zrpucbuvojskcwrhwevv.supabase.co';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qRuIoHNLVeV3zaGW0Q7A-Q_aYdwNLtj';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  // Login as a user (or just use an existing token)
  // Let's use fetch directly
  const apiUrl = 'https://www.ruralpop.com/api/checkout/escrow/wallet-status';
  
  const res = await fetch(apiUrl, {
      headers: {
          // We don't have a valid token here, but we can see if it returns 401 or 500
          'Authorization': `Bearer invalid`
      }
  });
  console.log(res.status, await res.text());
}

test();
