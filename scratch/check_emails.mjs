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
    const { data: publicUsers, error: pError } = await supabase.from('users').select('id, email, name').eq('id', 'd00781f5-7b0b-4d41-9c2e-0b2610ef4160');
    console.log("PUBLIC USERS:", publicUsers);

    const { data: authUser, error: aError } = await supabase.auth.admin.getUserById('d00781f5-7b0b-4d41-9c2e-0b2610ef4160');
    console.log("AUTH USER:", authUser?.user?.email);
}
main();
