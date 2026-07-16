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
    console.log("🔍 Fetching ALL listings with legacy Supabase URLs...");
    
    let allLegacyListings = [];
    let hasMore = true;
    let page = 0;
    
    while (hasMore) {
        const { data: listings, error } = await supabase
            .from('listings')
            .select('id, image_urls, title')
            .not('image_urls', 'is', null)
            .range(page * 1000, (page + 1) * 1000 - 1);

        if (error) {
            console.error("❌ Error fetching listings:", error);
            return;
        }
        
        if (listings.length === 0) {
            hasMore = false;
            break;
        }
        
        const legacyListings = listings.filter(l => 
            l.image_urls && l.image_urls.some(url => url.includes('supabase.co'))
        );
        allLegacyListings = allLegacyListings.concat(legacyListings);
        page++;
    }

    console.log(`Found ${allLegacyListings.length} listings to migrate.`);

    let optimizedCount = 0;
    let savedBytesTotal = 0;

    for (const listing of allLegacyListings) {
        if (!listing.image_urls || listing.image_urls.length === 0) continue;

        console.log(`\n📦 Migrating listing: ${listing.title} (${listing.id})`);
        
        let listingUrlsUpdated = false;
        let newImageUrls = [...listing.image_urls];

        for (let i = 0; i < listing.image_urls.length; i++) {
            let url = listing.image_urls[i];
            
            if (!url.includes('supabase.co')) continue;
            
            let r2Key = null;
            try {
                const urlObj = new URL(url);
                r2Key = decodeURIComponent(urlObj.pathname.substring(1));
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
                    const optimizedBuffer = await sharp(buffer)
                        .resize(600, 600, {
                            fit: 'inside',
                            withoutEnlargement: true,
                        })
                        .webp({ quality: 70 })
                        .toBuffer();

                    if (optimizedBuffer.length < originalSize) {
                        bufferToUpload = optimizedBuffer;
                        wasOptimized = true;
                    }
                }

                await s3Client.send(new PutObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: r2Key,
                    Body: bufferToUpload,
                    ContentType: wasOptimized ? 'image/webp' : (response.headers.get('content-type') || 'image/jpeg'),
                }));

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
                } else {
                    console.log(`  └ 🚚 Migrated to R2 without optimization.`);
                    optimizedCount++;
                }

            } catch (err) {
                console.error(`  └ ❌ Error processing image ${url}:`, err.message);
            }
        }
        
        if (listingUrlsUpdated) {
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
    console.log(`Total images migrated/optimized on R2: ${optimizedCount}`);
    console.log(`Total bandwidth saved per view: ${Math.round(savedBytesTotal / 1024 / 1024 * 100) / 100} MB`);
}

run().catch(console.error);
