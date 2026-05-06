import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const matchUrl = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const matchKey = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || matchUrl[1];
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || matchKey[1];

const supabase = createClient(url, key);

async function main() {
    const userId = 'd00781f5-7b0b-4d41-9c2e-0b2610ef4160';
    const { data: wallet } = await supabase.from('professional_wallets').select('*').eq('user_id', userId).single();
    
    console.log("WALLET IN DB:", wallet);
}
main();
