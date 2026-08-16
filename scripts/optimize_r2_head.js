require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require('sharp');

async function main() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });

    console.log("🔍 Fetching ALL listings...");
    
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

    console.log(`✅ Found ${allListings.length} listings. Scanning with HEAD requests for heavy images (>1MB)...`);

    let optimizedCount = 0;
    let savedBytesTotal = 0;

    for (const listing of allListings) {
        if (!listing.image_urls || listing.image_urls.length === 0) continue;

        let printedListingName = false;
        
        for (let i = 0; i < listing.image_urls.length; i++) {
            const url = listing.image_urls[i];
            try {
                // HEAD request is much faster
                const headRes = await fetch(url, { method: 'HEAD' });
                if (!headRes.ok) continue;
                
                const contentLength = headRes.headers.get('content-length');
                if (!contentLength) continue;
                
                const originalSize = parseInt(contentLength, 10);
                
                if (originalSize < 1024 * 1024) { // Only optimize > 1MB
                    continue; 
                }

                if (!printedListingName) {
                    console.log(`\n📦 Listing: ${listing.title} (${listing.id})`);
                    printedListingName = true;
                }

                console.log(`  └ 🛠  Image ${i+1} is ${Math.round(originalSize/1024)} KB. Optimizing...`);

                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const optimizedBuffer = await sharp(buffer)
                    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 70 })
                    .toBuffer();

                const newSize = optimizedBuffer.length;
                const savedKB = Math.round((originalSize - newSize) / 1024);
                
                if (newSize < originalSize) {
                    let isR2 = url.includes('r2.dev') || url.includes('media.ruralpop.com');
                    
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

    console.log(`\n🎉 SCAN AND OPTIMIZATION FINISHED!`);
    console.log(`Total heavy images optimized: ${optimizedCount}`);
    console.log(`Total bandwidth saved globally: ${Math.round(savedBytesTotal / 1024 / 1024 * 100) / 100} MB`);
}

main().catch(console.error);
