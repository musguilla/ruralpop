import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import fetch from 'node-fetch';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const R2_BUCKET = process.env.R2_BUCKET_NAME || 'ruralpop';
const CONCURRENCY = 10;
const SIZE_THRESHOLD_BYTES = 80 * 1024; // 80 KB threshold for R2 photos

async function run() {
  console.log('🚀 Starting deep photo review & optimization for the latest 1000 listings...');
  
  // 1. Fetch latest 1000 listings
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, title, created_at, image_urls')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('❌ Error fetching listings:', error);
    process.exit(1);
  }

  console.log(`📋 Retrieved ${listings.length} recent listings.`);

  // 2. Separate photos by provider
  const r2Tasks = [];
  const olxUpdates = [];

  for (const listing of listings) {
    if (!listing.image_urls || !Array.isArray(listing.image_urls)) continue;

    let listingModified = false;
    const newImageUrls = [...listing.image_urls];

    for (let i = 0; i < listing.image_urls.length; i++) {
      const url = listing.image_urls[i];

      if (url.includes('media.ruralpop.com') || url.includes('r2.dev')) {
        let r2Key = null;
        try {
          const u = new URL(url);
          r2Key = decodeURIComponent(u.pathname.substring(1));
          if (r2Key.startsWith('storage/v1/object/public/')) {
            r2Key = r2Key.replace('storage/v1/object/public/', '');
          }
        } catch (e) {
          continue;
        }

        if (r2Key) {
          r2Tasks.push({
            listingId: listing.id,
            title: listing.title,
            url,
            key: r2Key,
          });
        }
      } else if (url.includes('olxcdn.com')) {
        // Optimize oversize OLX dimensions (e.g. 2400x1600 -> 1000x700)
        const regex = /;s=(?:2400x1600|2000x1500|1500x2000|1528x1528|1200x1600)/;
        if (regex.test(url)) {
          newImageUrls[i] = url.replace(regex, ';s=1000x700');
          listingModified = true;
        }
      }
    }

    if (listingModified) {
      olxUpdates.push({
        id: listing.id,
        title: listing.title,
        image_urls: newImageUrls,
      });
    }
  }

  console.log(`📊 Found ${r2Tasks.length} R2 photos and ${olxUpdates.length} listings with oversized OLX images.`);

  // 3. Process R2 photos in batches
  let optimizedR2Count = 0;
  let alreadyLightCount = 0;
  let savedR2Bytes = 0;
  let errorsCount = 0;

  async function processR2Item(item) {
    try {
      // Step A: HEAD check
      const headRes = await fetch(item.url, { method: 'HEAD' });
      if (!headRes.ok) return;

      const size = parseInt(headRes.headers.get('content-length') || '0', 10);
      const contentType = headRes.headers.get('content-type') || '';

      // If already under threshold and WebP, skip
      if (size < SIZE_THRESHOLD_BYTES && contentType.includes('webp')) {
        alreadyLightCount++;
        return;
      }

      // Step B: Download and optimize
      const getRes = await fetch(item.url);
      if (!getRes.ok) return;

      const originalBuffer = Buffer.from(await getRes.arrayBuffer());
      const originalSize = originalBuffer.length;

      if (originalSize < SIZE_THRESHOLD_BYTES && contentType.includes('webp')) {
        alreadyLightCount++;
        return;
      }

      const optimizedBuffer = await sharp(originalBuffer)
        .resize(1000, 1000, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 75 })
        .toBuffer();

      const newSize = optimizedBuffer.length;

      if (newSize < originalSize) {
        await s3Client.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: item.key,
            Body: optimizedBuffer,
            ContentType: 'image/webp',
            CacheControl: 'public, max-age=31536000, immutable',
          })
        );

        const savedKB = (originalSize - newSize) / 1024;
        savedR2Bytes += (originalSize - newSize);
        optimizedR2Count++;

        console.log(
          `  ✨ [OPTIMIZED] ${(originalSize / 1024).toFixed(1)} KB -> ${(newSize / 1024).toFixed(1)} KB (-${savedKB.toFixed(1)} KB) | ${item.title.substring(0, 30)} | ${item.key}`
        );
      } else {
        alreadyLightCount++;
      }
    } catch (err) {
      errorsCount++;
      console.error(`  ⚠️ Error on ${item.key}:`, err.message);
    }
  }

  // Run R2 batch queue with concurrency limit
  console.log('\n⚙️ Optimizing heavy R2 photos...');
  for (let i = 0; i < r2Tasks.length; i += CONCURRENCY) {
    const chunk = r2Tasks.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(processR2Item));
    if ((i + CONCURRENCY) % 100 < CONCURRENCY) {
      console.log(`  Progress: ${Math.min(i + CONCURRENCY, r2Tasks.length)} / ${r2Tasks.length} R2 photos inspected...`);
    }
  }

  // 4. Update listings with optimized OLX URLs (natively downscaled from 2400px/2000px to 1000px)
  let updatedOlxListingsCount = 0;
  if (olxUpdates.length > 0) {
    console.log(`\n⚙️ Updating ${olxUpdates.length} listings with optimized OLX CDN URLs...`);
    for (let i = 0; i < olxUpdates.length; i += CONCURRENCY) {
      const chunk = olxUpdates.slice(i, i + CONCURRENCY);
      await Promise.all(
        chunk.map(async (u) => {
          const { error: updErr } = await supabase
            .from('listings')
            .update({ image_urls: u.image_urls })
            .eq('id', u.id);

          if (updErr) {
            console.error(`  ❌ Error updating listing ${u.id}:`, updErr.message);
          } else {
            updatedOlxListingsCount++;
          }
        })
      );
    }
  }

  console.log('\n==================================================');
  console.log('🎉 OPTIMIZATION COMPLETE!');
  console.log(`- Inspected R2 photos: ${r2Tasks.length}`);
  console.log(`- Heavy R2 photos optimized & re-uploaded: ${optimizedR2Count}`);
  console.log(`- Already light R2 photos skipped: ${alreadyLightCount}`);
  console.log(`- Total R2 storage & bandwidth saved: ${(savedR2Bytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`- Listings with oversized OLX CDN images optimized: ${updatedOlxListingsCount}`);
  console.log('==================================================\n');
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
