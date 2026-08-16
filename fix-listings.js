require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fix() {
   const { data: user } = await supabase.from('users').select('id, zoo_register_number').eq('email', 'victorlopezsantander@gmail.com').single();
   console.log("User zoo register:", user.zoo_register_number);
   
   if (!user.zoo_register_number) {
       await supabase.from('users').update({ zoo_register_number: 'ES390740001151' }).eq('id', user.id);
       console.log("Updated user zoo register to ES390740001151");
   }
   
   const listingsToUpdate = ['e4942822-95ab-4dfb-b357-72de271fdfdd', 'c12d878c-5f53-4dc4-a0bd-2d5808d900f8'];
   
   for (let id of listingsToUpdate) {
       const { data: listing } = await supabase.from('listings').select('tags').eq('id', id).single();
       let tags = listing.tags || [];
       if (!tags.includes('welfare_validated')) {
           tags.push('welfare_validated');
       }
       
       await supabase.from('listings').update({
           is_featured: false,
           featured_until: null,
           tags: tags
       }).eq('id', id);
   }
   
   console.log("Fixed listings: removed featured, added welfare_validated tag.");
}
fix();
