const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: '.env.local'});
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const {data: lChats, error: lErr} = await supabase.rpc('get_insights_top_listings_chats');
  console.log("top listings chats:", lChats, lErr);

  const {data: uChats, error: uErr} = await supabase.rpc('get_insights_top_users_chats');
  console.log("top users chats:", uChats, uErr);

  const {data: cData} = await supabase.from('conversations').select('id').limit(5);
  console.log("Conversations:", cData);
  
}
run();
