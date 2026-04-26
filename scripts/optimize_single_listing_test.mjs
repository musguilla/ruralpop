import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fetch from 'node-fetch';
import sharp from 'sharp';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function run() {
    const listingId = '6c8d16ee-446a-44ad-9e6f-781ce668a720'; // Anuncio "Mulina"
    console.log(`🔍 Fetching listing ${listingId} for test optimization...`);
    const { data: listing, error } = await supabase
        .from('listings')
        .select('id, image_urls, title')
        .eq('id', listingId)
        .single();

    if (error || !listing) {
        console.error("❌ Error:", error);
        return;
    }

    if (!listing.image_urls || listing.image_urls.length === 0) return;

    console.log(`📦 Optimizing listing: ${listing.title}`);
    
    for (let i = 0; i < listing.image_urls.length; i++) {
        const url = listing.image_urls[i];
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const originalSize = buffer.length;

            console.log(`  └ 📸 Image ${i+1} is ${Math.round(originalSize/1024)} KB.`);

            // ULTRA OPTIMIZATION TEST: 600x600 @ 70q
            const optimizedBuffer = await sharp(buffer)
                .resize(600, 600, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .webp({ quality: 70 })
                .toBuffer();

            const newSize = optimizedBuffer.length;
            
            let r2Key = null;
            try {
                const urlObj = new URL(url);
                r2Key = decodeURIComponent(urlObj.pathname.substring(1));
            } catch(e) { continue; }
            
            if (r2Key) {
                await s3Client.send(new PutObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME,
                    Key: r2Key,
                    Body: optimizedBuffer,
                    ContentType: 'image/webp',
                    CacheControl: 'public, max-age=31536000, immutable'
                }));
                console.log(`  └ 🚀 Success! Optimized to ${Math.round(newSize/1024)} KB (Saved ${Math.round((originalSize - newSize)/1024)} KB).`);
            }
        } catch (err) {
            console.error(`  └ ❌ Error processing image ${url}:`, err.message);
        }
    }
    console.log(`\n🎉 Test finished. Check the listing in production to verify quality.`);
}

run().catch(console.error);
