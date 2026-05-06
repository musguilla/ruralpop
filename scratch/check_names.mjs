import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const matchUrl = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const matchKey = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || matchUrl[1];
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || matchKey[1];

const supabase = createClient(url, key);

async function main() {
    // Check public.users
    const { data: publicUser } = await supabase.from('users').select('*').eq('email', 'hildegartbaquero@gmail.com').single();
    console.log("PUBLIC USER:", publicUser?.name, publicUser?.commercial_name);

    // Check auth.users via admin API
    const { data: authUser } = await supabase.auth.admin.getUserById(publicUser.id);
    console.log("AUTH USER METADATA:", authUser?.user?.user_metadata);
}
main();
