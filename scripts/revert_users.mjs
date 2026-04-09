import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zrpucbuvojskcwrhwevv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const db = createClient(supabaseUrl, supabaseKey);

async function revertUsers() {
  console.log("Reverting 'Usuario de Ruralpop' to 'Usuario'...");
  let count = 0;
  
  // Need to update those that I just updated back to 'Usuario'
  const { data: users, error } = await db
    .from('users')
    .select('id, name')
    .eq('name', 'Usuario de Ruralpop');

  if (users) {
      for (const u of users) {
          await db.from('users').update({ name: 'Usuario' }).eq('id', u.id);
          count++;
      }
  }

  console.log(`Reverted ${count} users back to 'Usuario'`);
}

revertUsers();
