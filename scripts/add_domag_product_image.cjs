const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Updating DOMAG product with PRE-OPTIMIZED image...");

    // 1. Fetch user ID
    const { data: user, error: errorUser } = await supabase.from('users').select('id').eq('commercial_name', 'DOMAG').single();
    if (errorUser || !user) {
        console.error("Error fetching DOMAG:", errorUser);
        return;
    }

    // 2. Fetch the existing listing
    const { data: listing, error: listingError } = await supabase.from('listings')
      .select('id, title')
      .eq('user_id', user.id)
      .ilike('title', '%SICMA F3 125%')
      .single();

    if (listingError || !listing) {
        console.error("Error fetching listing:", listingError);
        return;
    }

    // 3. Find latest media file
    const artifactsDir = '/Users/luis/.gemini/antigravity/brain/54bd403f-9554-41a2-b0dd-1df7a41a8985';
    const files = fs.readdirSync(artifactsDir).filter(f => f.startsWith('media__') && (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'))).sort();
    const latestFile = files[files.length - 1];

    if (!latestFile) {
        console.log("WARNING: Could not find the new media file in artifacts.");
        return;
    }

    const filePath = path.join(artifactsDir, latestFile);
    const fileData = fs.readFileSync(filePath);
    
    // 4. Optimize internally using sharp BEFORE uploading
    console.log(`[OPTIMIZING] ${latestFile} locally...`);
    const optimizedBuffer = await sharp(fileData)
        .resize(1000, 1000, {
            fit: 'inside',
            withoutEnlargement: true,
        })
        .jpeg({ quality: 60, progressive: true, mozjpeg: true })
        .toBuffer();
    
    console.log(`Original Size: ${(fileData.length / 1024).toFixed(1)} KB`);
    console.log(`Optimized Size: ${(optimizedBuffer.length / 1024).toFixed(1)} KB`);

    // 5. Upload optimized buffer
    const storagePath = `${user.id}/${listing.id}/photo_${Date.now()}.jpg`; 
    console.log(`Uploading optimized image to ${storagePath}...`);
    
    const { error: uploadError } = await supabase.storage.from('listings').upload(storagePath, optimizedBuffer, { 
        contentType: 'image/jpeg', 
        upsert: true 
    });
    
    if (uploadError) {
        console.error("Upload error:", uploadError);
        return;
    }

    const { data: pubData } = supabase.storage.from('listings').getPublicUrl(storagePath);
    const newImageUrl = pubData.publicUrl;
    console.log("Image uploaded:", newImageUrl);

    // 6. Update listings table
    console.log(`Updating listing in DB...`);
    const { error: updErr } = await supabase.from('listings').update({
        image_urls: [newImageUrl]
    }).eq('id', listing.id);

    if (updErr) {
        console.error(`Error updating listing:`, updErr);
    } else {
        console.log(`Listing updated successfully!`);
    }
}

run();
