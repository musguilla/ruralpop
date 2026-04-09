const { createClient } = require("@supabase/supabase-js");

require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log("Checking DB...");
  const { data: user1 } = await supabase.from("users").select("id, email").eq("email", "claudpriet@gmail.com").single();
  const { data: user2 } = await supabase.from("users").select("id, email").eq("email", "noita1105@gmail.com").single();
  
  if (!user1 || !user2) return console.log("Missing users");

  console.log("claudpriet:", user1.id);
  console.log("noita1105:", user2.id);

  const receiver_id = "6bd9d632-dcea-49e2-809e-2edb75184f53";
  
  const { data: realReceiver } = await supabase.from("users").select("id, email, expo_push_token").eq("id", receiver_id).single();
  console.log("Real receiver of messages:", realReceiver);

  const { data: claudprietToken } = await supabase.from("users").select("expo_push_token").eq("id", user1.id).single();
  console.log("Claudpriet push token:", claudprietToken);
}
run();
