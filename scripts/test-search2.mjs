import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/luis/Personal/__RURALPOP/ruralpopv1/.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await supabase
    .from('listings')
    .select('title, category, subcategory')
    .ilike('title', '%codorniz%')
    .limit(10);
console.log("Codorniz ads:", data);

const { data: b, error: e2 } = await supabase
    .from('listings')
    .select('title, category, subcategory')
    .ilike('title', '%Pienso%')
    .limit(10);
console.log("Pienso ads:", b);
