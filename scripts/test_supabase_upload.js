require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
async function main() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const buffer = Buffer.from('test');
    const { data, error } = await supabase.storage.from('listings').upload('test_upload.jpg', buffer, { upsert: true });
    console.log(data || error);
}
main();
