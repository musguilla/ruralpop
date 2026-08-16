require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('Testing createUser...');
  try {
    const { data: userResp, error } = await supabaseAdmin.auth.admin.createUser({
        email: "luis@musguilla.com",
        password: "Lui#7789",
        email_confirm: false,
        user_metadata: {
            name: "Alvaro Prieto",
            full_name: "Alvaro Prieto",
            tenant_id: "ea2490cc-dc33-48f3-bc7b-82b14aa70eb9",
        }
    });

    if (error) {
        console.error("Signup error:", error);
    } else {
        console.log("Success:", userResp.user.id);
    }
  } catch(e) {
    console.error("Crash:", e);
  }
}

run();
