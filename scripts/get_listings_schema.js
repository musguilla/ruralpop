require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
async function main() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase.rpc('exec_sql', { sql: "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'image_urls';" });
    console.log(data || error);
}
main();
