import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zrpucbuvojskcwrhwevv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) { throw new Error('NO KEY'); }

const db = createClient(supabaseUrl, supabaseKey);

async function run() {
  const query = "maiz amarillo";
  // Enclose in double quotes for postgREST syntax parsing if there are spaces?
  const encoded = `"${query}"`; // FTS syntax "maiz amarillo"

  const { data, error } = await db
    .from('listings')
    .select('title')
    .or(`title.wfts(spanish).${encoded},description.wfts(spanish).${encoded}`);
  console.log("wfts(spanish) with spaces:", data?.length, error?.message);
}

run();
