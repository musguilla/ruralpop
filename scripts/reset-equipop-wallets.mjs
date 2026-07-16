import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const stripe = new Stripe(process.env.EQUIPOP_STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

const EQUIPOP_TENANT_ID = '69d55371-2f70-4e67-b55c-4502bce305bb';
const CUTOFF_DATE = '2026-07-13T00:00:00Z';

async function run() {
  console.log('Fetching Equipop users...');
  
  // 1. Fetch all Equipop users
  let hasMore = true;
  let page = 0;
  let equipopUsers = [];
  
  while (hasMore) {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('tenant_id', EQUIPOP_TENANT_ID)
      .range(page * 1000, (page + 1) * 1000 - 1);
      
    if (error) {
      console.error('Error fetching users:', error);
      return;
    }
    
    if (users.length === 0) {
      hasMore = false;
      break;
    }
    
    equipopUsers = equipopUsers.concat(users);
    page++;
  }
  
  const equipopUserIds = equipopUsers.map(u => u.id);
  console.log(`Found ${equipopUserIds.length} Equipop users.`);
  
  // 2. Fetch wallets created before cutoff
  console.log(`Fetching wallets created before ${CUTOFF_DATE}...`);
  const { data: wallets, error: walletsError } = await supabaseAdmin
    .from('professional_wallets')
    .select('*')
    .lt('created_at', CUTOFF_DATE);
    
  if (walletsError) {
    console.error('Error fetching wallets:', walletsError);
    return;
  }
  
  // Filter for Equipop users only
  const equipopWallets = wallets.filter(w => equipopUserIds.includes(w.user_id));
  console.log(`Found ${equipopWallets.length} Equipop wallets created before the cutoff date.`);
  
  let deletedCount = 0;
  
  for (const wallet of equipopWallets) {
    if (!wallet.stripe_connected_account_id) continue;
    
    try {
        const account = await stripe.accounts.retrieve(wallet.stripe_connected_account_id);
        
        // If details_submitted is false, they haven't finished onboarding.
        if (!account.details_submitted) {
            console.log(`Account ${account.id} (User ${wallet.user_id}) is incomplete (details_submitted: false). Deleting wallet...`);
            
            const { error: deleteError } = await supabaseAdmin
                .from('professional_wallets')
                .delete()
                .eq('id', wallet.id);
                
            if (deleteError) {
                console.error(`Failed to delete wallet ${wallet.id}:`, deleteError);
            } else {
                console.log(`✅ Deleted wallet successfully.`);
                deletedCount++;
            }
        } else {
            console.log(`Account ${account.id} is already 100% complete. Skipping...`);
        }
    } catch (e) {
        console.error(`Failed to fetch Stripe account ${wallet.stripe_connected_account_id}:`, e.message);
    }
  }
  
  console.log(`\n🎉 FINISHED! Deleted ${deletedCount} incomplete wallets.`);
}

run();
