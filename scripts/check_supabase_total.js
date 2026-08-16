require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);
    
    let count = 0;
    let page = 0;
    const pageSize = 1000;
    
    while (true) {
        const { data, error } = await supabaseAdmin
            .from('listings')
            .select('image_urls')
            .range(page * pageSize, (page + 1) * pageSize - 1);
            
        if (error) break;
        if (!data || data.length === 0) break;
        
        for (const l of data) {
            if (l.image_urls && l.image_urls.some(u => u.includes('supabase.co'))) {
                count++;
            }
        }
        page++;
    }
    
    console.log("Total listings with Supabase Storage URLs:", count);
}

main();
