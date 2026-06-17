import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://zrpucbuvojskcwrhwevv.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const listingId = 'ce4dbd47-1cf4-40a6-a4ed-d363fd5fd74d';
  
  const { data: listing } = await supabase.from('listings').select('*').eq('id', listingId).single();
  console.log("Listing:", listing ? { id: listing.id, status: listing.status, user_id: listing.user_id, tags: listing.tags } : 'Not found');

  if (listing && listing.user_id) {
      const { data: user } = await supabase.from('users').select('*').eq('id', listing.user_id).single();
      console.log("User:", user ? { id: user.id, zoo_register_number: user.zoo_register_number, role: user.role } : 'Not found');
  }
}
check();
