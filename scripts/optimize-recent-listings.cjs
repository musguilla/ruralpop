require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function optimizeImage(bucket, filePath) {
    try {
        // 1. Download
        const { data: blob, error: downloadError } = await supabase.storage.from(bucket).download(filePath);
        if (downloadError) {
            console.error(`[DOWNLOAD ERROR] ${filePath}`, downloadError.message);
            return;
        }

        const buffer = Buffer.from(await blob.arrayBuffer());
        
        console.log(`[OPTIMIZING] ${filePath} (${(buffer.length / 1024).toFixed(2)} KB)`);

        let image = sharp(buffer);
        const metadata = await image.metadata();

        // 2. Resize and configure layout (Max 1000px for aggressive efficiency)
        image = image.resize(1000, 1000, {
            fit: 'inside',
            withoutEnlargement: true,
        });

        // 3. Compress based on format
        if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
            image = image.jpeg({ quality: 60, progressive: true, mozjpeg: true });
        } else if (metadata.format === 'png') {
            image = image.png({ quality: 60, compressionLevel: 9 });
        } else if (metadata.format === 'webp') {
            image = image.webp({ quality: 60 });
        } else {
            // Default to jpeg if unknown
            image = image.jpeg({ quality: 60 });
        }

        const outputBuffer = await image.toBuffer();

        // 4. Upload and replace
        const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, outputBuffer, {
            upsert: true,
        });

        if (uploadError) throw uploadError;

        console.log(`[OK] ${filePath} | Original: ${(buffer.length / 1024).toFixed(1)} KB -> Optimized: ${(outputBuffer.length / 1024).toFixed(1)} KB`);

    } catch (err) {
        console.error(`[ERROR] Failed to optimize ${filePath}`, err.message);
    }
}

async function main() {
    console.log('Fetching last 10 listings...');
    const { data: listings, error } = await supabase
        .from('listings')
        .select('id, title, image_urls')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) throw error;

    console.log(`Found ${listings.length} listings.`);

    for (const listing of listings) {
        console.log(`\nProcessing Listing: ${listing.title} (${listing.id})`);
        if (!listing.image_urls || listing.image_urls.length === 0) {
            console.log('No images found.');
            continue;
        }

        for (const url of listing.image_urls) {
            // Extract file path from public URL
            // Format: https://...supabase.co/storage/v1/object/public/listings/subpath/file.jpg
            const match = url.match(/\/public\/listings\/(.+)$/);
            if (match && match[1]) {
                const filePath = match[1];
                await optimizeImage('listings', filePath);
            } else {
                console.log(`[SKIP] URL format not recognized or external: ${url}`);
            }
        }
    }
}

main().catch(console.error);
