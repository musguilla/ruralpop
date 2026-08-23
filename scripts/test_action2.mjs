import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const user_id = '8d86f5d3-dfde-44b2-b37e-9125aa435987'; 
    
    const { data, error } = await supabase.from('listings').insert({
        title: 'Test listing backend',
        description: 'Test',
        price: 10,
        category: 'Tractores',
        location: 'Test Location',
        image_urls: ['https://media.ruralpop.com/test.jpg'],
        user_id: user_id,
        status: 'draft'
    }).select();
    
    console.log("Insert result:", JSON.stringify(data || error, null, 2));
}
main();
