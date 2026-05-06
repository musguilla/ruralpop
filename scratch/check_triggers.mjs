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
    const { data, error } = await supabase.rpc('run_sql', { query: `
        SELECT event_manipulation, action_statement
        FROM information_schema.triggers
        WHERE event_object_schema = 'auth' AND event_object_table = 'users';
    ` });
    
    if (error) {
        console.error("RPC Error:", error);
        // Fallback: try to just run a raw query via postgres if we have a connection string
        // but we don't. Let's see if run_sql exists.
    } else {
        console.log("TRIGGERS:", data);
    }
}
main();
