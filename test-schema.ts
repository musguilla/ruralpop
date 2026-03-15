import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zrpucbuvojskcwrhwevv.supabase.co';
const supabaseKey = 'sb_secret_zo6E6YvBYltAqRmLbmGOiA_zk3Xrt9U';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    console.log(data ? Object.keys(data[0]) : error);
}
check();
