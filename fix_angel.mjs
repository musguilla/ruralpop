import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://zrpucbuvojskcwrhwevv.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
  const listingId = '9d1f842c-acdf-440d-96ee-071c0d41d1f9';
  
  // Get listing
  const { data: listing } = await supabase.from('listings').select('user_id, tags').eq('id', listingId).single();
  console.log("Listing:", listing);

  if (listing) {
      // 1. Add tag to listing
      const existingTags = listing.tags || [];
      const newTags = Array.from(new Set([...existingTags, 'welfare_validated']));
      await supabase.from('listings').update({ tags: newTags }).eq('id', listingId);
      console.log("Listing tags updated.");

      // 2. Revert user role to 'user'
      await supabase.from('users').update({ role: 'user' }).eq('id', listing.user_id);
      console.log("User role reverted to 'user'.");
  }
}
fix();
