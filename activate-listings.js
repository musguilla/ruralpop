require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function activate() {
   const now = new Date();
   const nextMonth = new Date();
   nextMonth.setDate(now.getDate() + 30);
   
   // Activate Mastines
   const { data: mastines, error: mErr } = await supabase.from('listings')
      .update({ status: 'active', is_featured: true, featured_until: nextMonth.toISOString() })
      .eq('id', 'e4942822-95ab-4dfb-b357-72de271fdfdd');
      
   console.log("Mastines updated:", mErr || "Success");

   // Activate Blue Merle
   const { data: blue, error: bErr } = await supabase.from('listings')
      .update({ status: 'active', is_featured: true, featured_until: nextMonth.toISOString() })
      .eq('id', 'c12d878c-5f53-4dc4-a0bd-2d5808d900f8');
      
   console.log("Blue Merle updated:", bErr || "Success");
}
activate();
