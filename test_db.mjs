import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://zrpucbuvojskcwrhwevv.supabase.co', 'sb_secret_zo6E6YvBYltAqRmLbmGOiA_zk3Xrt9U');
const { data, error } = await supabase.rpc('get_triggers');
console.log(data, error);
