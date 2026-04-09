const { createClient } = require("@supabase/supabase-js");
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: user1 } = await supabase.from("users").update({ expo_push_token: null }).eq("email", "claudpriet@gmail.com");
  console.log("Cleared token for claudpriet");
}
run();
