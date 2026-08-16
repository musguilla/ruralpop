require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function highlight() {
   const now = new Date();
   const nextMonth = new Date();
   nextMonth.setDate(now.getDate() + 30);
   
   const { data, error } = await supabase.from('listings')
      .update({ is_featured: true, featured_until: nextMonth.toISOString() })
      .eq('id', 'cf06ab62-8d05-4abb-b459-bb9942e2ca92');
      
   console.log("Listing highlighted:", error || "Success");
}
highlight();
