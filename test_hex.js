const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkHex() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data } = await supabase
        .from('listings')
        .select('title')
        .eq('id', '94bc205f-bab3-4ccc-a7f6-9e3f975ddbe7');
        
    const title = data[0].title;
    console.log("Title:", title);
    for (let i = 0; i < title.length; i++) {
        console.log(title[i], title.charCodeAt(i).toString(16));
    }
}

checkHex();
