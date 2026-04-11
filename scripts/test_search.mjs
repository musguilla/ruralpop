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
  console.log("Testing textSearch vs ilike on 'maiz'");
  
  // 1. Text Search Spanish Dictionary
  const { data: d1, error: e1 } = await db.from('listings').select('title').textSearch('title', 'maiz', { config: 'spanish' });
  console.log("textSearch 'maiz':", d1?.length, e1?.message);

  // 2. ilike
  const { data: d2, error: e2 } = await db.from('listings').select('title').ilike('title', '%maiz%');
  console.log("ilike '%maiz%':", d2?.length, e2?.message);

  // 3. ilike with MAIZ
  const { data: d3, error: e3 } = await db.from('listings').select('title').ilike('title', '%maíz%');
  console.log("ilike '%maíz%':", d3?.length, e3?.message);
}

run();
