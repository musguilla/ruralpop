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
  const { data: d1, error: e1 } = await db.from('listings').select('title').ilike('title', '%tract%');
  console.log("ilike '%tract%':", d1?.length);

  const { data: d2, error: e2 } = await db.from('listings').select('title').or("title.wfts(spanish).tract");
  console.log("wfts 'tract':", d2?.length);

  const { data: d3, error: e3 } = await db.from('listings').select('title').or("title.fts(spanish).tract:*");
  console.log("fts 'tract:*':", d3?.length);
}

run();
