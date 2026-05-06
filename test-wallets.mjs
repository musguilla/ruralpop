import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://zrpucbuvojskcwrhwevv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data: wallets } = await supabaseAdmin.from("professional_wallets").select("*");
  if (!wallets) return;
  
  for (const w of wallets) {
      if (w.stripe_connected_account_id) {
          try {
              await stripe.accounts.retrieve(w.stripe_connected_account_id);
              console.log(w.stripe_connected_account_id, "exists");
          } catch (e) {
              console.log(w.stripe_connected_account_id, "MISSING OR ERROR:", e.message);
          }
      }
  }
}

test();
