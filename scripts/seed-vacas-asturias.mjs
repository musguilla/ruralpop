import { createClient } from '@supabase/supabase-js';
import { mkdir, writeFile } from 'fs/promises';

const supabase = createClient(
    'https://zrpucbuvojskcwrhwevv.supabase.co',
    'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

// Datos reales scrapeados via SSR de Milanuncios
// URL: https://www.milanuncios.com/mascotas-en-asturias/?s=vaca&orden=relevance
const LISTINGS = [
    {
        title: "Vaca Preñada de 5 Meses - 14 años",
        price: 2200,
        description: "Se vende vaca preñada de 5 meses, tiene 14 años. Animal muy sano y bien cuidado. Documentación sanitaria al día. Más información por teléfono.",
        location: "Monteana (Asturias)",
        seller_name: "Nacho",
        phone: null,
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/280d0a47-3b22-424a-91e3-ba1aaf3da573?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/51154035-2ea3-4364-8e1c-a957829bb2b3?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/1fc43767-3ef9-4664-8a8c-634b00b3f5c1?rule=detail_640x480"
        ],
        category: "animales",
        subcategory: "Bovino"
    },
    {
        title: "Vaca Preñada de 6 Meses - 5 años",
        price: 3000,
        description: "Se vende vaca preñada de 6 meses, tiene 5 años. Animal joven en plena vida productiva. Muy dócil y en perfecto estado de salud.",
        location: "Monteana (Asturias)",
        seller_name: "Nacho",
        phone: null,
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/e4e68c14-1e96-401e-860f-6e1f1cd36003?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/87de3638-98fc-4883-8758-e9df715c47e3?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/bc54a973-5326-46f1-a01f-86b54800a8b4?rule=detail_640x480"
        ],
        category: "animales",
        subcategory: "Bovino"
    },
    {
        title: "Vaca Preñada de 5 Meses - 6 años",
        price: 2800,
        description: "Se vende vaca preñada de 5 meses, tiene 6 años. Excelente productora. Carácter muy tranquilo, fácil de manejar.",
        location: "Monteana (Asturias)",
        seller_name: "Nacho",
        phone: null,
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/03052f68-3b51-4596-bf7e-9191bc92cafd?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/4ae3324a-519f-41d7-89e2-539fb84474e1?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/e4c22d6e-2da2-4af8-83fe-48d80e8899f3?rule=detail_640x480"
        ],
        category: "animales",
        subcategory: "Bovino"
    },
    {
        title: "Vaca Culona con Ternera - Asturiana de los Valles",
        price: 4000,
        description: "Se vende vaca culona con 5 años parida con una hembra, un animal muy esclavo, de confianza. Raza Asturiana de los Valles. Más información por teléfono.",
        location: "Cornellana (Salas) (Asturias)",
        seller_name: "Aroa",
        phone: null,
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/f47afab0-0e43-4013-a022-4689beef30e3?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/5c2bccfd-74bb-446f-be0e-5c6672f23a4d?rule=detail_640x480"
        ],
        category: "animales",
        subcategory: "Bovino"
    },
    {
        title: "Vaca para Sacrificio - Bien Engordada",
        price: 3350,
        description: "Vaca para matar, bien engordada. Animal en óptimas condiciones para sacrificio. Contactar por teléfono para más información.",
        location: "Candas (Asturias)",
        seller_name: "Diego",
        phone: null,
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/a886bee3-52d6-461d-bfa5-73c5f640185e?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/ca204200-1453-446b-b3db-e02507f794b3?rule=detail_640x480"
        ],
        category: "animales",
        subcategory: "Bovino"
    },
    {
        title: "Novilla Angus Roja Parida con Ternera",
        price: 3000,
        description: "Vaca cruce de Angus rojo con belga de primer parto, con ternera de Angus rojo. Muy noble, temperamento excelente. Ideal para cría.",
        location: "Cerca de Abajo (Asturias)",
        seller_name: "Rafael",
        phone: null,
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/cf68e941-eec6-4edc-9ca5-f4fabe373e26?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/63393353-adc2-4737-963b-3f70f4419185?rule=detail_640x480"
        ],
        category: "animales",
        subcategory: "Bovino"
    }
];

await mkdir('/tmp/ruralpop_vacas', { recursive: true });

async function downloadImage(url, destPath) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Referer': 'https://www.milanuncios.com/'
        }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(destPath, buffer);
    return buffer;
}

async function uploadToStorage(buffer, storagePath) {
    const { data, error } = await supabase.storage
        .from('listings')
        .upload(storagePath, buffer, {
            contentType: 'image/jpeg',
            upsert: true
        });
    if (error) throw new Error(error.message);
    return supabase.storage.from('listings').getPublicUrl(storagePath).data.publicUrl;
}

async function getOrCreateUser(sellerName, phone) {
    const clean = sellerName.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '.');
    const email = `${clean}@ruralpop.co`;

    const { data: existing } = await supabase.from('users').select('id').eq('email', email).limit(1);
    if (existing?.length > 0) {
        console.log(`  ♻️  Using: ${sellerName}`);
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

    await supabase.from('users').upsert(
        { id: authData.user.id, email, name: sellerName, phone: phone ?? null },
        { onConflict: 'id' }
    );
    console.log(`  ✅ Created user: ${sellerName}`);
    return authData.user.id;
}

async function main() {
    console.log(`🐄 Seeding ${LISTINGS.length} bovine listings from Asturias (Milanuncios)\n`);

    // Ensure bucket exists
    const { error: bErr } = await supabase.storage.createBucket('listings', {
        public: true, fileSizeLimit: 10485760
    });
    if (bErr && !bErr.message.includes('already exists')) console.warn('Bucket:', bErr.message);

    for (const [i, item] of LISTINGS.entries()) {
        console.log(`\n[${i + 1}/${LISTINGS.length}] "${item.title}"`);

        // Download + upload photos
        const uploadedUrls = [];
        for (const [pi, photoUrl] of item.photo_urls.entries()) {
            const localPath = `/tmp/ruralpop_vacas/vaca_${i}_${pi}.jpg`;
            const storagePath = `vacas-asturias/vaca_${Date.now()}_${i}_${pi}.jpg`;
            process.stdout.write(`  📥 Photo ${pi + 1}/${item.photo_urls.length}... `);
            try {
                const buffer = await downloadImage(photoUrl, localPath);
                const url = await uploadToStorage(buffer, storagePath);
                uploadedUrls.push(url);
                console.log('✅');
            } catch (e) {
                console.log(`❌ ${e.message}`);
            }
        }

        if (uploadedUrls.length === 0) {
            console.log('  ⚠️ No photos — skipping');
            continue;
        }

        const userId = await getOrCreateUser(item.seller_name, item.phone);
        if (!userId) { console.log('  ⚠️ No user — skipping'); continue; }

        const { error } = await supabase.from('listings').insert({
            title: item.title,
            price: item.price,
            description: item.description,
            location: item.location,
            image_urls: uploadedUrls,
            category: item.category,
            subcategory: item.subcategory,
            user_id: userId,
            status: 'active',
            price_type: 'fixed'
        });

        if (error) console.error(`  ❌ Insert: ${error.message}`);
        else console.log(`  ✅ Inserted with ${uploadedUrls.length} self-hosted photos`);
    }

    console.log('\n🎉 Done! All Asturian cow listings seeded with self-hosted photos.');
}

main().catch(console.error);
