const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkListings() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    async function checkWord(word) {
        console.log(`\n--- Checking "${word}" ---`);
        const { data, error } = await supabase
            .from('listings')
            .select('id, title, status, tenant_id, shared_to_equipop')
            .ilike('title', `%${word}%`);
            
        if (error) {
            console.error(error);
        } else {
            console.log(`Found ${data.length} listings:`);
            console.log(data);
        }
    }
    
    await checkWord('pantalones');
    await checkWord('cincha');
    await checkWord('muserola');
    await checkWord('cabezada');
}

checkListings();
