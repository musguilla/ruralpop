import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    // 1. Get 10 recent ads to see their categories
    const { data: ads1, error: err1 } = await supabase.from('listings').select('title, category, subcategory').order('created_at', { ascending: false }).limit(10);
    console.log("Recent ads:", ads1);

    // 2. Query forraje
    const { data: ads2, error: err2 } = await supabase.from('listings').select('title, category, subcategory').eq('category', 'forraje');
    console.log("Forraje Exact match ads:", ads2?.map(a => `${a.title} | ${a.category} | ${a.subcategory}`));

    // 3. Query '%forraje%' in subcategory (just in case)
    const { data: ads3, error: err3 } = await supabase.from('listings').select('title, category, subcategory').ilike('subcategory', '%forraje%');
    console.log("Forraje ilike subcategory ads:", ads3);

    // 4. Query '%Ovino%' in subcategory
    const { data: ads4, error: err4 } = await supabase.from('listings').select('title, category, subcategory').ilike('subcategory', '%Ovino%');
    console.log("Ovino ilike subcategory ads:", ads4?.map(a => `${a.title} | ${a.category} | ${a.subcategory}`));

    // 5. Look for any ad with title containing Ninfas or as indicated
    const { data: ads5, error: err5 } = await supabase.from('listings').select('title, category, subcategory').ilike('title', '%Pienso para patos%');
    console.log("Pienso para patos:", ads5);
}
run();
