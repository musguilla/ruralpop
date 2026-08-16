require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);
    
    // We can't directly query pg_stat_statements from the JS client because it is in a different schema (usually public cannot access it).
    // Let's check the size of the listings table in JSON to see if a full table scan over API would be 2.4GB.
    
    const { data: countData } = await supabaseAdmin.from('listings').select('id', { count: 'exact', head: true });
    console.log("Total listings:", countData);
}

main();
