import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://zrpucbuvojskcwrhwevv.supabase.co';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qRuIoHNLVeV3zaGW0Q7A-Q_aYdwNLtj';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // I might not have it here

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  // Let's create a temporary user or sign up
  const email = `test-wallet-${Date.now()}@example.com`;
  const { data: { session }, error: signUpError } = await supabase.auth.signUp({
      email,
      password: 'password123'
  });
  
  if (signUpError) {
      console.log("Signup error:", signUpError);
      return;
  }
  
  console.log("Signed up user:", email);
  console.log("Token:", session?.access_token ? "Yes" : "No");

  if (!session?.access_token) return;

  const apiUrl = 'https://www.ruralpop.com/api/checkout/escrow/onboarding-link';
  const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${session.access_token}`
      }
  });
  
  console.log("Status:", res.status);
  console.log("Response text:", await res.text());
}

test();
