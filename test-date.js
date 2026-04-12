const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://zrpucbuvojskcwrhwevv.supabase.co',
  'sb_secret_zo6E6YvBYltAqRmLbmGOiA_zk3Xrt9U'
);

async function run() {
  const { data, error } = await supabase.from('magazine_posts').select('slug, published_at').limit(5);
  console.log(data);
}
run();
