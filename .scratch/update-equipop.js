require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('Updating Equipop listings...');
  const EQUIPOP_TENANT_ID = '69d55371-2f70-4e67-b55c-4502bce305bb';
  
  const { data, error } = await supabase
    .from('listings')
    .update({ vender_online: true })
    .eq('tenant_id', EQUIPOP_TENANT_ID)
    .select('id');

  if (error) {
    console.error('Error updating listings:', error);
  } else {
    console.log(`Successfully updated ${data.length} listings to vender_online = true`);
  }
}

run();
