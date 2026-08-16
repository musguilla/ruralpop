require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    // Create anon client
    const supabase = createClient(url, anonKey);
    
    // Test if there are any RLS policies or if we can use createClient with global headers
    console.log("Anon key:", anonKey.substring(0, 15));
}

main();
