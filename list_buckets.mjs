import { createClient } from '@supabase/supabase-js';
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zrpucbuvojskcwrhwevv.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_zo6E6YvBYltAqRmLbmGOiA_zk3Xrt9U'
);
async function test() {
    const { data, error } = await supabaseAdmin.storage.listBuckets();
    console.log(data);
}
test();
