require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const equipopId = '69d55371-2f70-4e67-b55c-4502bce305bb';
  const ruralpopId = 'ea2490cc-dc33-48f3-bc7b-82b14aa70eb9';
  const tenantFilterString = `tenant_id.eq.${equipopId},and(tenant_id.eq.${ruralpopId},shared_to_equipop.eq.true)`;

  let query = supabase
    .from("listings")
    .select(`id, title, tenant_id, shared_to_equipop, status, users!inner(is_ghost)`)
    .eq("status", "active")
    .eq("users.is_ghost", false)
    .or(tenantFilterString)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data, error } = await query;
  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Latest items on Equipop:");
  for (const item of data) {
    console.log(`- ${item.title} (Tenant: ${item.tenant_id === equipopId ? 'Equipop' : 'Ruralpop'}, Shared: ${item.shared_to_equipop})`);
    if (item.tenant_id !== equipopId && item.shared_to_equipop !== true) {
      console.log("  !!! THIS SHOULD NOT BE HERE !!!");
    }
  }
}

run();
