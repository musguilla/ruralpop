import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zrpucbuvojskcwrhwevv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'MISSING';
const db = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await db.from('users').select('name, count').eq('name', 'Usuario').limit(1);
  if (error) console.error(error);
  // Just manual query
  const res = await db.from('users').select('name').eq('name', 'Usuario').limit(5);
  console.log("Users uniquely named 'Usuario':", res.data?.length);
}
run();
