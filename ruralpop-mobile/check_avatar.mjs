import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabaseUrl = envConfig.EXPO_PUBLIC_SUPABASE_URL || envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.EXPO_PUBLIC_SUPABASE_ANON_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: users } = await supabase.from('users').select('id, name, avatar_url').limit(5);
    console.log("USERS:", users);
    const { data: profiles } = await supabase.from('public_profiles').select('id, avatar_url').limit(5);
    console.log("PROFILES:", profiles);
}
check();
