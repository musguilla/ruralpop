require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase.from('listings').select('title, created_at, featured_until').eq('is_featured', true).order('featured_until', { ascending: false }).limit(5);
    console.log(data);
}
main();
