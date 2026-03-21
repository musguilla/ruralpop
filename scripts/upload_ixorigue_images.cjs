const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Fetching buckets...");
    const { data: buckets } = await supabase.storage.listBuckets();
    console.log("Buckets:", buckets.map(b => b.name).join(", "));
    
    // Find Ixorigue user
    const { data: user } = await supabase.from('users').select('id').eq('email', 'info@ixorigue.com').single();
    if (!user) {
        console.log("User not found");
        return;
    }
    const userId = user.id;
    console.log("Ixorigue ID:", userId);

    // Get the listings
    const { data: listings } = await supabase.from('listings').select('id, title').eq('user_id', userId);
    
    const collarListing = listings.find(l => l.title.includes('Collar'));
    const cowListing = listings.find(l => l.title.includes('Cow Pro'));

    const artifactsDir = '/Users/luis/.gemini/antigravity/brain/54bd403f-9554-41a2-b0dd-1df7a41a8985';
    const files = fs.readdirSync(artifactsDir).filter(f => f.startsWith('media__') && (f.endsWith('.png') || f.endsWith('.jpg'))).sort();
    
    // The last two files should be the photos (oldest to newest: Collar then Cow Pro, or we just upload both to both if unsure, but let's map them)
    const latestFiles = files.slice(-2);
    console.log("Latest media files:", latestFiles);

    // 1. Upload Logo
    const logoUrl = "https://scontent-mad2-1.cdninstagram.com/v/t51.2885-15/449823556_519602357066579_1321145909805647246_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-mad2-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2gHrgU_Dw8fHUAg2QrDQDY_3_JMK9bSq4NtbnbH5_-QpKBJP3lo6RE05wC6Xw3MGM3k&_nc_ohc=JvU5XVNMejsQ7kNvwE7sxzB&_nc_gid=UrhP0ra982TDfsL0J561xw&edm=AGW0Xe4BAAAA&ccb=7-5&oh=00_AfyTcGcl2E9SadVq7EhbiSb2v0nl-4xtmGhPp80wduK_rg&oe=69C26048&_nc_sid=94fea1";
    console.log("Downloading logo...");
    const logoRes = await fetch(logoUrl);
    const logoBuffer = await logoRes.arrayBuffer();

    const logoPath = `${userId}/logo.jpg`;
    await supabase.storage.from('avatars').upload(logoPath, logoBuffer, { contentType: 'image/jpeg', upsert: true });
    // if avatars bucket fails, try listings
    const { data: pubUrlData } = supabase.storage.from('avatars').getPublicUrl(logoPath);
    let finalLogoUrl = pubUrlData.publicUrl;
    
    await supabase.from('users').update({ avatar_url: finalLogoUrl, company_logo_url: finalLogoUrl }).eq('id', userId);
    console.log("Logo updated:", finalLogoUrl);

    // 2. Upload product images to 'listings' bucket
    for (let i = 0; i < latestFiles.length; i++) {
        const filePath = path.join(artifactsDir, latestFiles[i]);
        const fileData = fs.readFileSync(filePath);
        
        // guess which is which
        const targetListing = i === 0 ? collarListing : cowListing;
        if (!targetListing) continue;

        const storagePath = `${userId}/${targetListing.id}/photo.png`;
        console.log(`Uploading ${latestFiles[i]} to ${storagePath} for ${targetListing.title}`);
        
        await supabase.storage.from('listings').upload(storagePath, fileData, { contentType: 'image/png', upsert: true });
        const { data: publicUrlData } = supabase.storage.from('listings').getPublicUrl(storagePath);
        
        console.log("Public URL:", publicUrlData.publicUrl);
        
        await supabase.from('listings').update({ image_urls: [publicUrlData.publicUrl] }).eq('id', targetListing.id);
    }

    console.log("Done uploading images!");
}

run();
