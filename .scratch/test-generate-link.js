require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('Testing generateLink after createUser...');
  
  // 1. Delete user if exists to start fresh
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const user = users.users.find(u => u.email === "test-generate-link@example.com");
  if (user) {
    await supabaseAdmin.auth.admin.deleteUser(user.id);
  }

  // 2. Create user
  console.log("Creating user...");
  const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: "test-generate-link@example.com",
    password: "Password123!",
    email_confirm: false
  });

  if (createError) {
    console.error("Create error:", createError);
    return;
  }
  console.log("Created successfully.", createData.user.id);

  // 3. Generate Link
  console.log("Generating link...");
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'signup',
    email: "test-generate-link@example.com",
    password: "Password123!",
    options: {
        redirectTo: "http://localhost:3000/login?verified=true"
    }
  });

  if (linkError) {
    console.error("Link error:", linkError);
  } else {
    console.log("Link generated:", linkData.properties.action_link);
  }
}

run();
