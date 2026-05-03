import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const matchUrl = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
  const matchKey = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
  if (matchUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = matchUrl[1];
  if (matchKey) process.env.SUPABASE_SERVICE_ROLE_KEY = matchKey[1];
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data, error } = await supabase.rpc('run_sql', { sql: "SELECT conname, pg_get_constraintdef(c.oid) FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace WHERE n.nspname = 'public';" });
    console.log(data, error);
}
main();
