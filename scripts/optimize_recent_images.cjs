const { createClient } = require('@supabase/supabase-js');
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
    console.log("🔍 Fetching the latest 150 listings...");
    const { data: listings, error } = await supabase
        .from('listings')
        .select('id, user_id, image_urls, title')
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error("❌ Error fetching listings:", error);
        return;
    }

    let optimizedCount = 0;
    let savedBytesTotal = 0;

    for (const listing of listings) {
        if (!listing.image_urls || listing.image_urls.length === 0) continue;

        console.log(`\n📦 Checking listing: ${listing.title} (${listing.id})`);
        
        for (let i = 0; i < listing.image_urls.length; i++) {
            const url = listing.image_urls[i];
            
            try {
                // Fetch the image
                const response = await fetch(url);
                if (!response.ok) {
                    console.log(`  └ ⚠️ Skipped: Could not fetch ${url}`);
                    continue;
                }

                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const originalSize = buffer.length;

                // If image is less than 150KB, it's likely already optimized
                if (originalSize < 150 * 1024) {
                    console.log(`  └ ✅ Image ${i+1} is already light (${Math.round(originalSize/1024)} KB). Skipping.`);
                    continue;
                }

                console.log(`  └ 🛠  Image ${i+1} is heavy (${Math.round(originalSize/1024)} KB). Optimizing...`);

                // Optimize with sharp
                const optimizedBuffer = await sharp(buffer)
                    .resize(1000, 1000, {
                        fit: 'inside',
                        withoutEnlargement: true,
                    })
                    .webp({ quality: 80 }) // WebP is vastly superior for compression
                    .toBuffer();

                const newSize = optimizedBuffer.length;
                const savedKB = Math.round((originalSize - newSize) / 1024);
                
                if (newSize < originalSize) {
                    // Extract the storage path from public URL
                    // Example URL 1: https://...supabase.co/storage/v1/object/public/listings/123/456/photo.jpg
                    // Example URL 2: https://media.ruralpop.com/listings/123/456/photo.jpg
                    let storagePath = null;
                    const supabaseMatch = url.match(/\/object\/public\/listings\/(.+)$/);
                    const mediaMatch = url.match(/media\.ruralpop\.com\/listings\/(.+)$/);
                    
                    if (supabaseMatch && supabaseMatch[1]) {
                        storagePath = supabaseMatch[1];
                    } else if (mediaMatch && mediaMatch[1]) {
                        storagePath = mediaMatch[1];
                    }

                    if (!storagePath) {
                        console.log(`  └ ⚠️ Could not extract storage path for ${url}`);
                        continue;
                    }

                    // Re-upload (upsert) the optimized WebP or JPEG
                    const { error: uploadError } = await supabase.storage
                        .from('listings')
                        .upload(storagePath, optimizedBuffer, {
                            contentType: 'image/webp',
                            upsert: true
                        });

                    if (uploadError) {
                        console.error(`  └ ❌ Upload failed for ${storagePath}:`, uploadError);
                    } else {
                        console.log(`  └ 🚀 Success! Optimized to ${Math.round(newSize/1024)} KB (Saved ${savedKB} KB).`);
                        optimizedCount++;
                        savedBytesTotal += (originalSize - newSize);
                    }
                } else {
                  console.log(`  └ 🤷 Optimization didn't reduce size (already efficient format).`);
                }

            } catch (err) {
                console.error(`  └ ❌ Error processing image ${url}:`, err.message);
            }
        }
    }

    console.log(`\n🎉 FINISHED!`);
    console.log(`Total images strictly optimized: ${optimizedCount}`);
    console.log(`Total bandwidth saved per view: ${Math.round(savedBytesTotal / 1024 / 1024 * 100) / 100} MB`);
}

run();
