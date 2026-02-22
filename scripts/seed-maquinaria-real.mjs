import { createClient } from '@supabase/supabase-js';
import { createWriteStream, readFileSync } from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';

const supabase = createClient(
    'https://zrpucbuvojskcwrhwevv.supabase.co',
    'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

const REAL_LISTINGS = [
    {
        title: "Tractor Kubota Seminuevo - 85CV",
        price: 22000,
        description: "Se vende tractor kubota seminuevo, el tractor está en perfecto estado de mecánica, ruedas delanteras nuevas, asientos de aire nuevo, todos los filtros y aceites recién cambiados, cabina con aire acondicionado, 85 cv.",
        location: "Sevilla",
        seller_name: "Macarena",
        phone: "618360002",
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/8db7da08-cd6d-4ef9-aa61-652c61e85e35?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/03fcb2f8-6e9d-46ca-b055-ee0d6a8449ef?rule=hw396"
        ]
    },
    {
        title: "Tractor BJR 3800 4WD - Con Rotabator",
        price: 14500,
        description: "Cambio o vendo BJR en un estado muy bueno con dirección hidráulica. Tiene rotabator remolque traccionado, arado y desbrozadora de cadenas. Cambiaría por un tractor de 60cv en adelante.",
        location: "Beasain",
        seller_name: "Antonio Moreno",
        phone: null,
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/d97c10aa-e9a6-4d62-8246-08a85567ce35?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/e6e1f9c0-7668-4144-b386-7169e59aaa66?rule=hw396"
        ]
    },
    {
        title: "Minitractor Yanmar/Kubota - Con Rotavator incluido",
        price: 3900,
        description: "Minitractores japoneses. Modelos Yanmar y Kubota. Precio ya incluye rotavator. Están completamente revisados y listos para trabajar.",
        location: "Sevilla",
        seller_name: "AGROParque Es",
        phone: "629289332",
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/328d78f2-94c7-4c2d-8bba-50afae452e80?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/388c1be7-2fa5-47e4-aa61-29b446db627e?rule=hw396"
        ]
    },
    {
        title: "Tractor Case JX85 - Solo 3834 Horas",
        price: 20000,
        description: "Tractor Case Modelo JX85, año 2003. Potencia 62 kW, cilindrada 3908 cm³. Solo tiene 3834 horas, sin casi uso y en buen estado de conservación.",
        location: "Canalejas del Arroyo (Cuenca)",
        seller_name: "Angel",
        phone: null,
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/bce68b76-ef49-429e-8778-273cf4e7fb53?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/c33d77a0-4b28-487a-948e-f9dfdcbe7021?rule=hw396"
        ]
    },
    {
        title: "Tractocarro Pasquali 21CV - Estado Impecable",
        price: 12000,
        description: "Tractocarro Pasquali 21cv. Dirección, frenos y basculante hidráulicos. Documentación en regla y remolque homologado para ITV. Impecable estado.",
        location: "Villanueva (Asturias)",
        seller_name: "Manuel",
        phone: "618166284",
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/592881f9-6a2c-4815-a63d-07cb87b3df24?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/4efa462a-6be4-4bc4-aa15-96a3d8b1e94c?rule=hw396"
        ]
    },
    {
        title: "Tractor Fendt Favorit 610 - Doble Tracción",
        price: 12000,
        description: "Vendo por cese actividad tractor agrícola Fendt 610 Favorit con doble tracción y embrague centrífugo. Año 1975. Ruedas con buen dibujo.",
        location: "Madrid",
        seller_name: "Ignacio Moratilla",
        phone: "630436241",
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/77041e03-7366-47f6-8a2e-59a5ca467c49?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/b965eaac-32ff-4de6-8bcb-40c8b2ba7b3b?rule=hw396"
        ]
    },
    {
        title: "Mini Tractor Iseki TM15 - Doble Tracción",
        price: 5500,
        description: "Se vende tractor Iseki TM15 doble tracción con rotavator en muy buenas condiciones. Mejor ver y probar.",
        location: "Zarza de Granadilla (Cáceres)",
        seller_name: "Alirio García",
        phone: null,
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/5e37d1a2-886e-4c25-b8a2-f1660febc100?rule=hw396_70"
        ]
    }
];

// Ensure tmp folder exists
await mkdir('/tmp/ruralpop_imgs', { recursive: true });

async function downloadImage(url, destPath) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            'Referer': 'https://www.milanuncios.com/'
        }
    });
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    const { writeFileSync } = await import('fs');
    writeFileSync(destPath, Buffer.from(arrayBuffer));
}

async function uploadToSupabase(localPath, storagePath) {
    const { readFileSync } = await import('fs');
    const fileBuffer = readFileSync(localPath);

    const { data, error } = await supabase.storage
        .from('listings')
        .upload(storagePath, fileBuffer, {
            contentType: 'image/jpeg',
            upsert: true
        });

    if (error) throw new Error(`Upload error: ${error.message}`);

    const { data: urlData } = supabase.storage
        .from('listings')
        .getPublicUrl(storagePath);

    return urlData.publicUrl;
}

async function getOrCreateUser(sellerName, phone) {
    const cleanName = sellerName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '.');
    const email = `${cleanName}@ruralpop.co`;

    const { data: existing } = await supabase
        .from('users').select('id').eq('email', email).limit(1);

    if (existing && existing.length > 0) {
        console.log(`  ♻️  Using existing user: ${sellerName}`);
        return existing[0].id;
    }

    const { data: authData, error } = await supabase.auth.admin.createUser({
        email, password: 'Ruralpop2025!',
        user_metadata: { name: sellerName },
        email_confirm: true
    });

    if (error) {
        console.error(`  ❌ Auth error: ${error.message}`);
        const { data: fb } = await supabase.from('users').select('id').limit(1);
        return fb?.[0]?.id ?? null;
    }

    const userId = authData.user.id;
    await supabase.from('users').upsert(
        { id: userId, email, name: sellerName, phone: phone ?? null },
        { onConflict: 'id' }
    );
    console.log(`  ✅ Created user: ${sellerName}`);
    return userId;
}

async function main() {
    console.log('📸 Downloading images and uploading to Supabase Storage...\n');

    // Ensure bucket exists (public)
    const { error: bucketError } = await supabase.storage.createBucket('listings', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
    });
    if (bucketError && !bucketError.message.includes('already exists')) {
        console.error('Bucket error:', bucketError.message);
    } else {
        console.log('✅ Storage bucket ready\n');
    }

    for (const [idx, item] of REAL_LISTINGS.entries()) {
        console.log(`\n[${idx + 1}/${REAL_LISTINGS.length}] "${item.title}"`);

        // 1. Download + upload each photo
        const uploadedUrls = [];
        for (const [photoIdx, photoUrl] of item.photo_urls.entries()) {
            const ext = 'jpg';
            const localPath = `/tmp/ruralpop_imgs/listing_${idx}_${photoIdx}.${ext}`;
            const storagePath = `scraped/listing_${Date.now()}_${idx}_${photoIdx}.${ext}`;

            process.stdout.write(`  📥 Downloading photo ${photoIdx + 1}... `);
            try {
                await downloadImage(photoUrl, localPath);
                process.stdout.write('✅ ');

                process.stdout.write('📤 Uploading to Supabase... ');
                const publicUrl = await uploadToSupabase(localPath, storagePath);
                uploadedUrls.push(publicUrl);
                console.log('✅');
                console.log(`     → ${publicUrl.substring(0, 80)}...`);
            } catch (e) {
                console.log(`❌ ${e.message}`);
            }
        }

        if (uploadedUrls.length === 0) {
            console.log('  ⚠️ No photos uploaded, skipping listing');
            continue;
        }

        // 2. Create or get user
        const userId = await getOrCreateUser(item.seller_name, item.phone);
        if (!userId) continue;

        // 3. Insert listing with Supabase Storage URLs
        const { error } = await supabase.from('listings').insert({
            title: item.title,
            price: item.price,
            description: item.description,
            location: item.location,
            image_urls: uploadedUrls,
            category: 'maquinaria',
            subcategory: null,
            user_id: userId,
            status: 'active',
            price_type: 'negotiable'
        });

        if (error) {
            console.error(`  ❌ Insert error: ${error.message}`);
        } else {
            console.log(`  ✅ Listing inserted with ${uploadedUrls.length} hosted photo(s)!`);
        }
    }

    console.log('\n🎉 Done! All listings with self-hosted photos are in the database.');
}

main().catch(console.error);
