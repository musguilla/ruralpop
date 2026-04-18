import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/luis/Personal/__RURALPOP/ruralpopv1/.env.local' });
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data } = await s.from('users').select('name, email, is_ghost, plan_type').eq('id', 'e19fde26-adc6-41fa-913c-a51c44a62762').single();
console.log("User e19fde26-adc6-41fa-913c-a51c44a62762:", data);
