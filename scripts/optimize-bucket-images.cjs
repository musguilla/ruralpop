require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listFiles(bucket, path = '') {
    let allFiles = [];
    try {
        const { data, error } = await supabase.storage.from(bucket).list(path, {
            limit: 1000,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
        });

        if (error) {
            console.error('Error listing path', path, error);
            return [];
        }

        for (const item of data) {
            if (item.id === null || !item.metadata) {
                const subPath = path ? `${path}/${item.name}` : item.name;
                const subFiles = await listFiles(bucket, subPath);
                allFiles.push(...subFiles);
            } else {
                if (item.name !== '.emptyFolderPlaceholder') {
                    allFiles.push({
                        name: item.name,
                        path: path ? `${path}/${item.name}` : item.name,
                        size: item.metadata.size,
                        mimetype: item.metadata.mimetype
                    });
                }
            }
        }
    } catch (err) {
        console.error('Error in listFiles', err);
    }
    return allFiles;
}

async function optimizeImage(bucket, file) {
    try {
        // 1. Download
        const { data: blob, error: downloadError } = await supabase.storage.from(bucket).download(file.path);
        if (downloadError) throw downloadError;

        const buffer = Buffer.from(await blob.arrayBuffer());
        let image = sharp(buffer);
        const metadata = await image.metadata();

        // 2. Resize and configure layout
        image = image.resize(1600, 1600, {
            fit: 'inside',
            withoutEnlargement: true,
        });

        // 3. Compress based on format
        if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
            image = image.jpeg({ quality: 80, progressive: true, mozjpeg: true });
        } else if (metadata.format === 'png') {
            image = image.png({ quality: 80, compressionLevel: 8 });
        } else if (metadata.format === 'webp') {
            image = image.webp({ quality: 80 });
        }

        const outputBuffer = await image.toBuffer();

        // Skip if it actually got larger (unlikely with mozjpeg, but just in case)
        if (outputBuffer.length >= buffer.length) {
            console.log(`[SKIP] ${file.path} (Optimized size ${outputBuffer.length} is not smaller than original ${buffer.length})`);
            return;
        }

        // 4. Upload and replace
        const { error: uploadError } = await supabase.storage.from(bucket).upload(file.path, outputBuffer, {
            contentType: file.mimetype,
            upsert: true,
        });

        if (uploadError) throw uploadError;

        console.log(`[OK] ${file.path} | Original: ${(buffer.length / 1024 / 1024).toFixed(2)} MB -> Optimized: ${(outputBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    } catch (err) {
        console.error(`[ERROR] Failed to optimize ${file.path}`, err.message);
    }
}

async function main() {
    console.log('Fetching file list from "listings" bucket...');
    const files = await listFiles('listings');
    console.log(`Found ${files.length} total files.`);

    const MAX_SIZE = 800 * 1024; // 800 KB
    const heavyFiles = files.filter(f => f.size > MAX_SIZE);
    console.log(`Found ${heavyFiles.length} files larger than 800 KB.`);

    let i = 0;
    for (const file of heavyFiles) {
        i++;
        console.log(`\n(${i}/${heavyFiles.length}) Processing: ${file.path} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        await optimizeImage('listings', file);
    }
}

main().catch(console.error);
