import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function run() {
    const { count: listingsCount, error: err1 } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
        
    const { data: listings, error: err2 } = await supabase
        .from('listings')
        .select('category, subcategory, province_id, location')
        .eq('status', 'active');
        
    const combinations = new Set();
    
    listings?.forEach(l => {
        if (!l.category || !l.subcategory) return;
        if (l.province_id) {
            combinations.add(`${l.category}|${l.subcategory}|${l.province_id}`);
            if (l.location) {
                combinations.add(`${l.category}|${l.subcategory}|${l.province_id}|${l.location}`);
            }
        }
    });
    
    console.log(`Nuevas URLs SEO (Provincia/Localidad): ${combinations.size}`);
}
run();
