import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://zrpucbuvojskcwrhwevv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qRuIoHNLVeV3zaGW0Q7A-Q_aYdwNLtj'; // anon key from eas.json

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data, error } = await supabase
      .from('escrow_orders')
      .select(`
          id, status, seller_net_amount_cents, created_at, listing_id,
          listings ( title, image_urls, price, sold_price )
      `)
      .limit(1);
      
  console.log("Error:", error);
  console.log("Data:", data);
}

test();
