import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fetch from 'node-fetch';
import sharp from 'sharp';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function run() {
    console.log("🔍 Fetching the latest 150 listings for R2 optimization...");
    const { data: listings, error } = await supabase
        .from('listings')
        .select('id, image_urls, title')
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
                const response = await fetch(url);
                if (!response.ok) {
                    console.log(`  └ ⚠️ Skipped: Could not fetch ${url}`);
                    continue;
                }

                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const originalSize = buffer.length;

                if (originalSize < 150 * 1024) {
                    console.log(`  └ ✅ Image ${i+1} is already light (${Math.round(originalSize/1024)} KB). Skipping.`);
                    continue;
                }

                console.log(`  └ 🛠  Image ${i+1} is heavy (${Math.round(originalSize/1024)} KB). Optimizing...`);

                const optimizedBuffer = await sharp(buffer)
                    .resize(1000, 1000, {
                        fit: 'inside',
                        withoutEnlargement: true,
                    })
                    .webp({ quality: 80 })
                    .toBuffer();

                const newSize = optimizedBuffer.length;
                const savedKB = Math.round((originalSize - newSize) / 1024);
                
                if (newSize < originalSize) {
                    let r2Key = null;
                    try {
                        const urlObj = new URL(url);
                        r2Key = decodeURIComponent(urlObj.pathname.substring(1));
                    } catch(e) {
                         console.log(`  └ ⚠️ Invalid URL: ${url}`);
                         continue;
                    }
                    
                    if (!r2Key) {
                         console.log(`  └ ⚠️ Could not extract R2 key from ${url}`);
                         continue;
                    }

                    await s3Client.send(new PutObjectCommand({
                        Bucket: R2_BUCKET_NAME,
                        Key: r2Key,
                        Body: optimizedBuffer,
                        ContentType: 'image/webp',
                    }));

                    console.log(`  └ 🚀 Success! Optimized to ${Math.round(newSize/1024)} KB (Saved ${savedKB} KB) on R2.`);
                    optimizedCount++;
                    savedBytesTotal += (originalSize - newSize);
                    
                } else {
                  console.log(`  └ 🤷 Optimization didn't reduce size.`);
                }

            } catch (err) {
                console.error(`  └ ❌ Error processing image ${url}:`, err.message);
            }
        }
    }

    console.log(`\n🎉 FINISHED!`);
    console.log(`Total images optimized on R2: ${optimizedCount}`);
    console.log(`Total bandwidth saved per view: ${Math.round(savedBytesTotal / 1024 / 1024 * 100) / 100} MB`);
}

run().catch(console.error);
