import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://zrpucbuvojskcwrhwevv.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data } = await supabase.from('listings').select('id, title, user_id, status, is_featured, tags').ilike('title', '%Cachorra de mastin%');
  console.log(data);
}
run();
