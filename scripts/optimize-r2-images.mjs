import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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
        .limit(150);

    if (error) {
        console.error("❌ Error fetching listings:", error);
        return;
    }

    let optimizedCount = 0;
    let savedBytesTotal = 0;

    for (const listing of listings) {
        if (!listing.image_urls || listing.image_urls.length === 0) continue;

        console.log(`\n📦 Checking listing: ${listing.title} (${listing.id})`);
        
        let listingUrlsUpdated = false;
        let newImageUrls = [...listing.image_urls];

        for (let i = 0; i < listing.image_urls.length; i++) {
            let url = listing.image_urls[i];
            
            // Rewrite old R2 dev URL to custom domain for fetching
            if (url.includes('pub-d5e9ba1c275e41eb8458dc0c7fe5f525.r2.dev')) {
                url = url.replace('https://pub-d5e9ba1c275e41eb8458dc0c7fe5f525.r2.dev', 'https://media.ruralpop.com');
                newImageUrls[i] = url;
                listingUrlsUpdated = true;
            }
            
            let r2Key = null;
            let isSupabaseUrl = url.includes('supabase.co');
            try {
                const urlObj = new URL(url);
                r2Key = decodeURIComponent(urlObj.pathname.substring(1));
                // Fix the deeply nested path issue for old Supabase URLs
                if (r2Key.startsWith('storage/v1/object/public/')) {
                    r2Key = r2Key.replace('storage/v1/object/public/', '');
                }
            } catch(e) {
                 console.log(`  └ ⚠️ Invalid URL: ${url}`);
                 continue;
            }
            
            if (!r2Key) {
                 console.log(`  └ ⚠️ Could not extract R2 key from ${url}`);
                 continue;
            }

            try {
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });
                if (!response.ok) {
                    console.log(`  └ ⚠️ Skipped: Could not fetch ${url}`);
                    continue;
                }

                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const originalSize = buffer.length;

                let bufferToUpload = buffer;
                let wasOptimized = false;

                if (originalSize >= 80 * 1024) {
                    console.log(`  └ 🛠  Image ${i+1} is heavy (${Math.round(originalSize/1024)} KB). Optimizing...`);
                    console.log(`  └ [DEBUG] Starting sharp processing...`);
                    const optimizedBuffer = await sharp(buffer)
                        .resize(600, 600, {
                            fit: 'inside',
                            withoutEnlargement: true,
                        })
                        .webp({ quality: 70 })
                        .toBuffer();
                    console.log(`  └ [DEBUG] Sharp processing complete.`);

                    if (optimizedBuffer.length < originalSize) {
                        bufferToUpload = optimizedBuffer;
                        wasOptimized = true;
                    } else {
                        console.log(`  └ 🤷 Optimization didn't reduce size.`);
                    }
                } else {
                    console.log(`  └ ✅ Image ${i+1} is already light (${Math.round(originalSize/1024)} KB).`);
                }

                if (wasOptimized || isSupabaseUrl) {
                    console.log(`  └ [DEBUG] Uploading to R2: ${r2Key}...`);
                    await s3Client.send(new PutObjectCommand({
                        Bucket: R2_BUCKET_NAME,
                        Key: r2Key,
                        Body: bufferToUpload,
                        ContentType: wasOptimized ? 'image/webp' : (response.headers.get('content-type') || 'image/jpeg'),
                    }));
                    console.log(`  └ [DEBUG] Upload complete.`);

                    const newR2Url = `https://media.ruralpop.com/${r2Key}`;
                    if (newImageUrls[i] !== newR2Url) {
                        newImageUrls[i] = newR2Url;
                        listingUrlsUpdated = true;
                    }

                    if (wasOptimized) {
                        const savedKB = Math.round((originalSize - bufferToUpload.length) / 1024);
                        console.log(`  └ 🚀 Success! Optimized to ${Math.round(bufferToUpload.length/1024)} KB (Saved ${savedKB} KB) on R2.`);
                        optimizedCount++;
                        savedBytesTotal += (originalSize - bufferToUpload.length);
                    } else if (isSupabaseUrl) {
                        console.log(`  └ 🚚 Migrated to R2 without optimization.`);
                    }
                }

            } catch (err) {
                console.error(`  └ ❌ Error processing image ${url}:`, err.message);
            }
        }
        
        if (listingUrlsUpdated) {
            console.log(`  └ 📝 Updating database URLs for listing...`);
            const { error: updateError } = await supabase
                .from('listings')
                .update({ image_urls: newImageUrls })
                .eq('id', listing.id);
            if (updateError) {
                console.error(`  └ ❌ Error updating database:`, updateError.message);
            } else {
                console.log(`  └ ✅ Database updated successfully.`);
            }
        }
    }

    console.log(`\n🎉 FINISHED!`);
    console.log(`Total images optimized on R2: ${optimizedCount}`);
    console.log(`Total bandwidth saved per view: ${Math.round(savedBytesTotal / 1024 / 1024 * 100) / 100} MB`);
}

run().catch(console.error);
