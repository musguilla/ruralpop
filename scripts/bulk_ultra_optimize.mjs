import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fetch from 'node-fetch';
import sharp from 'sharp';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function run() {
    console.log("🔍 Fetching ALL listings for ULTRA optimization...");
    // Fetch all listings
    let allListings = [];
    let page = 0;
    while (true) {
        const { data: listings, error } = await supabase
            .from('listings')
            .select('id, image_urls, title')
            .range(page * 1000, (page + 1) * 1000 - 1);
        if (error) throw error;
        if (!listings || listings.length === 0) break;
        allListings = allListings.concat(listings);
        page++;
    }

    console.log(`✅ Found ${allListings.length} listings. Starting ultra optimization...`);

    let optimizedCount = 0;
    let savedBytesTotal = 0;

    for (const listing of allListings) {
        if (!listing.image_urls || listing.image_urls.length === 0) continue;

        let printedListingName = false;
        
        for (let i = 0; i < listing.image_urls.length; i++) {
            const url = listing.image_urls[i];
            try {
                const response = await fetch(url);
                if (!response.ok) continue;

                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const originalSize = buffer.length;

                if (originalSize < 100 * 1024) {
                    continue; // Skip silently if already <100kb to keep console clean
                }

                if (!printedListingName) {
                    console.log(`\n📦 Listing: ${listing.title} (${listing.id})`);
                    printedListingName = true;
                }

                console.log(`  └ 🛠  Image ${i+1} is ${Math.round(originalSize/1024)} KB. Optimizing...`);

                const optimizedBuffer = await sharp(buffer)
                    .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 70 })
                    .toBuffer();

                const newSize = optimizedBuffer.length;
                const savedKB = Math.round((originalSize - newSize) / 1024);
                
                if (newSize < originalSize) {
                    let isR2 = url.includes('r2.dev');
                    
                    if (isR2) {
                        const urlObj = new URL(url);
                        const r2Key = decodeURIComponent(urlObj.pathname.substring(1));
                        await s3Client.send(new PutObjectCommand({
                            Bucket: process.env.R2_BUCKET_NAME,
                            Key: r2Key,
                            Body: optimizedBuffer,
                            ContentType: 'image/webp',
                            CacheControl: 'public, max-age=31536000, immutable'
                        }));
                    } else {
                        // Supabase
                        const pathMatch = url.match(/\/object\/public\/listings\/(.+)$/);
                        if (!pathMatch || !pathMatch[1]) continue;
                        const storagePath = pathMatch[1];
                        
                        const { error: uploadError } = await supabase.storage
                            .from('listings')
                            .upload(storagePath, optimizedBuffer, {
                                contentType: 'image/webp',
                                upsert: true,
                                cacheControl: '31536000'
                            });
                        if (uploadError) throw uploadError;
                    }

                    console.log(`  └ 🚀 Success! Optimized to ${Math.round(newSize/1024)} KB (Saved ${savedKB} KB).`);
                    optimizedCount++;
                    savedBytesTotal += (originalSize - newSize);
                }

            } catch (err) {
                console.error(`  └ ❌ Error processing image ${url}:`, err.message);
            }
        }
    }

    console.log(`\n🎉 ULTRA OPTIMIZATION FINISHED!`);
    console.log(`Total heavy images optimized: ${optimizedCount}`);
    console.log(`Total bandwidth saved globally: ${Math.round(savedBytesTotal / 1024 / 1024 * 100) / 100} MB`);
}

run().catch(console.error);
