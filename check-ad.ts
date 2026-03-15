import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zrpucbuvojskcwrhwevv.supabase.co';
const supabaseKey = 'sb_secret_zo6E6YvBYltAqRmLbmGOiA_zk3Xrt9U'; // Assuming I can use the existing anon key or service role from env. Wait, we used the service role key previously: "apikey: sb_secret_zo6E6YvBYltAqRmLbmGOiA_zk3Xrt9U"

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('id', '7bWCuFa3cLHSj9XmcGPDmL');
        
    console.log(data, error);
}

check();
