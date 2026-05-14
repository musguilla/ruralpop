import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://zrpucbuvojskcwrhwevv.supabase.co', 'sb_secret_zo6E6YvBYltAqRmLbmGOiA_zk3Xrt9U');
const { data, error } = await supabase.from('users').select('avatar_url, company_logo_url, role').eq('email', 'hildegartbaquero@gmail.com').limit(1);
console.log(data);
