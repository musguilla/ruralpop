import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

console.log("Checking all listings...");
const { data: listings } = await supabase.from('listings').select('id, title, image_urls');
const maliciousListings = listings?.filter(l => l.image_urls?.some(url => typeof url === 'string' && url.includes('undefined/'))) || [];
console.log(`Found ${maliciousListings.length} infected listings.`);

console.log("Checking all users...");
const { data: users } = await supabase.from('users').select('id, name, avatar_url');
const maliciousUsers = users?.filter(u => typeof u.avatar_url === 'string' && u.avatar_url.includes('undefined/')) || [];
console.log(`Found ${maliciousUsers.length} infected users.`);
