require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const equipopId = '69d55371-2f70-4e67-b55c-4502bce305bb';
  const ruralpopId = 'ea2490cc-dc33-48f3-bc7b-82b14aa70eb9';
  const filterString = `tenant_id.eq.${equipopId},and(tenant_id.eq.${ruralpopId},shared_to_equipop.eq.true)`;

  console.log("Filter string:", filterString);

  const { data, error } = await supabase
    .from('listings')
    .select('id, title, tenant_id, shared_to_equipop')
    .or(filterString)
    .limit(100);

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Total items found with filter:", data.length);
  
  const badItems = data.filter(item => item.tenant_id !== equipopId && item.shared_to_equipop !== true);
  console.log("Bad items (tenant != equipop AND shared != true):", badItems.length);
  console.log(badItems);

  // Let's also fetch an item that the user says shouldn't be there, if we can find one.
  const { data: allData } = await supabase
    .from('listings')
    .select('id, title, tenant_id, shared_to_equipop')
    .eq('tenant_id', ruralpopId)
    .eq('shared_to_equipop', false)
    .limit(5);
    
  console.log("Sample of items that have shared_to_equipop = false:", allData);
}

run();
