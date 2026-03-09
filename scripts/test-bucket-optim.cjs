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
            // Si no tiene id, normalmente es un prefijo (carpeta) en Supabase Storage
            if (item.id === null || !item.metadata) {
                // Es un directorio/carpeta
                const subPath = path ? `${path}/${item.name}` : item.name;
                const subFiles = await listFiles(bucket, subPath);
                allFiles.push(...subFiles);
            } else {
                // Es un archivo
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

async function main() {
    console.log('Fetching file list...');
    const files = await listFiles('listings');
    console.log(`Found ${files.length} total files.`);

    const MAX_SIZE = 1 * 1024 * 1024; // 1 MB
    const heavyFiles = files.filter(f => f.size > MAX_SIZE);
    console.log(`Found ${heavyFiles.length} files larger than 1MB.`);

    for (const file of heavyFiles) {
        console.log(`Processing: ${file.path} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    }
}

main().catch(console.error);
