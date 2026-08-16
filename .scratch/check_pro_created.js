require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, created_at')
    .eq('role', 'profesional')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching users:", error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

checkUsers();
