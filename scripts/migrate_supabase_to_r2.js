require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);

    const s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
    });

    const bucketName = process.env.R2_BUCKET_NAME;
    const publicBaseUrl = process.env.NEXT_PUBLIC_R2_URL || `https://media.ruralpop.com`;

    let page = 0;
    const pageSize = 1000;
    let totalMigrated = 0;

    console.log("=== Starting Image Migration from Supabase to R2 ===");

    while (true) {
        const { data: listings, error } = await supabaseAdmin
            .from('listings')
            .select('id, image_urls')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
            console.error("Error fetching listings:", error);
            break;
        }

        if (!listings || listings.length === 0) {
            break;
        }

        for (const listing of listings) {
            if (!listing.image_urls) continue;
            
            let needsUpdate = false;
            let newUrls = [];

            for (const imageUrl of listing.image_urls) {
                if (imageUrl.includes('.supabase.co')) {
                    try {
                        // Extract path after /public/
                        const pathParts = imageUrl.split('/public/');
                        if (pathParts.length !== 2) {
                            console.log(`Skipping unknown format: ${imageUrl}`);
                            newUrls.push(imageUrl);
                            continue;
                        }
                        
                        const storagePath = pathParts[1]; // e.g. listings/uuid-timestamp-0.jpg
                        
                        // Download from Supabase
                        const response = await fetch(imageUrl);
                        if (!response.ok) {
                            console.log(`Failed to download ${imageUrl}: ${response.statusText}`);
                            newUrls.push(imageUrl); // keep old URL if fail
                            continue;
                        }
                        
                        const arrayBuffer = await response.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        const contentType = response.headers.get('content-type') || 'image/jpeg';

                        // Upload to R2
                        await s3Client.send(new PutObjectCommand({
                            Bucket: bucketName,
                            Key: storagePath,
                            Body: buffer,
                            ContentType: contentType,
                        }));

                        const newUrl = `${publicBaseUrl}/${storagePath}`;
                        newUrls.push(newUrl);
                        needsUpdate = true;
                        
                        console.log(`Migrated: ${storagePath}`);
                    } catch (e) {
                        console.error(`Error processing ${imageUrl}:`, e.message);
                        newUrls.push(imageUrl);
                    }
                } else {
                    newUrls.push(imageUrl);
                }
            }

            if (needsUpdate) {
                const { error: updateErr } = await supabaseAdmin
                    .from('listings')
                    .update({ image_urls: newUrls })
                    .eq('id', listing.id);
                    
                if (updateErr) {
                    console.error(`Failed to update listing ${listing.id}:`, updateErr);
                } else {
                    console.log(`Updated listing ${listing.id} in DB.`);
                    totalMigrated++;
                }
            }
        }
        
        page++;
    }

    console.log(`=== Migration Complete! ${totalMigrated} listings updated. ===`);
}

main();
