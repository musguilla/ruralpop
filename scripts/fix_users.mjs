import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zrpucbuvojskcwrhwevv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('No SUPABASE_SERVICE_ROLE_KEY found in .env.local');
  process.exit(1);
}

const db = createClient(supabaseUrl, supabaseKey);

async function fixUsers() {
  console.log("Fetching users with name 'Usuario' or null...");
  const { data: users, error } = await db
    .from('users')
    .select('id, name')
    .or('name.eq.Usuario,name.is.null')
    .limit(1000);

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  let count = 0;
  for (const user of users) {
    // If the name is literally "Usuario", let's fix it by getting their auth.users metadata
    if (user.name === 'Usuario' || user.name === null) {
      console.log(`Found user ${user.id} with name "${user.name}". Checking auth metadata...`);
      const { data: authUser, error: authError } = await db.auth.admin.getUserById(user.id);
      
      if (authError || !authUser?.user) {
        console.error(`Could not fetch auth user ${user.id}:`, authError?.message);
        continue;
      }

      const meta = authUser.user.user_metadata || {};
      const actualName = meta.full_name || meta.name;

      if (actualName && actualName !== 'Usuario') {
        console.log(`  -> Actual name found: "${actualName}". Updating...`);
        const { error: updateError } = await db.from('users').update({ name: actualName }).eq('id', user.id);
        if (updateError) {
          console.error(`  -> Failed to update:`, updateError.message);
        } else {
          console.log(`  -> Successfully updated!`);
          count++;
        }
      } else {
        console.log(`  -> No real name found in auth metadata. Updating to 'Usuario de Ruralpop'`);
        await db.from('users').update({ name: 'Usuario de Ruralpop' }).eq('id', user.id);
        count++;
      }
    }
  }

  console.log(`Done! Fixed ${count} users.`);
}

fixUsers();
