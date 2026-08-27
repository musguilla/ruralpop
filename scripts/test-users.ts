import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zrpucbuvojskcwrhwevv.supabase.co';
const supabaseKey = 'sb_secret_zo6E6YvBYltAqRmLbmGOiA_zk3Xrt9U';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const search = "luis";
    let query = supabase
        .from("users")
        .select("*")
        .or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
        
    const { data, error } = await query;
    console.log(data?.length, error);
}

check();
