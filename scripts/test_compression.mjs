import fetch from 'node-fetch';
import sharp from 'sharp';

async function run() {
    const url = 'https://pub-d5e9ba1c275e41eb8458dc0c7fe5f525.r2.dev/listings/2026/04/m2v8oipnwun-cmalwo.jpg';
    const res = await fetch(url);
    const buffer = Buffer.from(await res.arrayBuffer());
    
    console.log(`Original size: ${(buffer.length / 1024).toFixed(2)} KB`);
    
    const test1 = await sharp(buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 60 })
        .toBuffer();
    console.log(`800px, 60q: ${(test1.length / 1024).toFixed(2)} KB`);
    
    const test2 = await sharp(buffer)
        .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 70 })
        .toBuffer();
    console.log(`600px, 70q: ${(test2.length / 1024).toFixed(2)} KB`);
    
    const test3 = await sharp(buffer)
        .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 60 })
        .toBuffer();
    console.log(`600px, 60q: ${(test3.length / 1024).toFixed(2)} KB`);
}
run();
