import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/luis/Personal/__RURALPOP/ruralpopv1/.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

console.log("Checking last 200 listings...");
const { data: listings, error: listingErr } = await supabase
    .from('listings')
    .select('id, title, image_urls, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

if (listingErr) {
    console.error("Listing Error:", listingErr);
} else {
    const maliciousListings = listings.filter(l => {
        if (!l.image_urls) return false;
        return l.image_urls.some(url => typeof url === 'string' && url.includes('undefined/'));
    });
    console.log(`Found ${maliciousListings.length} infected listings out of 200.`);
    maliciousListings.forEach(l => console.log(` - ID: ${l.id} / Title: ${l.title}`, l.image_urls));
}

console.log("\nChecking last 50 users...");
const { data: users, error: userErr } = await supabase
    .from('users')
    .select('id, name, avatar_url, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

if (userErr) {
    console.error("User Error:", userErr);
} else {
    const maliciousUsers = users.filter(u => {
      if (!u.avatar_url) return false;
      return typeof u.avatar_url === 'string' && u.avatar_url.includes('undefined/');
    });
    console.log(`Found ${maliciousUsers.length} infected users out of 50.`);
    maliciousUsers.forEach(u => console.log(` - ID: ${u.id} / Name: ${u.name}`, u.avatar_url));
}
