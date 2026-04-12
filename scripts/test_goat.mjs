import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env.local') });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zrpucbuvojskcwrhwevv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const db = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data } = await db.from('listings').select('title, description, location').ilike('title', '%MACHO CABRÍO%');
  console.log(JSON.stringify(data, null, 2));
}
run();
