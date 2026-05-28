const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);
async function run() {
  const { data, error } = await supabase.from('users').select('id, email, commercial_name, name').not('ghost_token', 'is', null);
  if (error) {
    console.error(error);
    process.exit(1);
  }
  let csv = 'email,commercial_name,name\n';
  data.forEach(u => {
    csv += `"${u.email}","${u.commercial_name || ''}","${u.name || ''}"\n`;
  });
  fs.writeFileSync('/Users/luis/.gemini/antigravity/brain/642e8535-f1eb-421d-9fee-4793c7ba9ca2/scratch/ghost_companies.csv', csv);
  console.log(`Exported ${data.length} users.`);
}
run();
