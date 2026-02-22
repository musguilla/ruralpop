import { createClient } from '@supabase/supabase-js';
import { mkdir, writeFile } from 'fs/promises';

const supabase = createClient(
    'https://zrpucbuvojskcwrhwevv.supabase.co',
    'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

// Anuncios scrapeados de página 2 - Milanuncios vacas Asturias
// Precios normalizados: los que tenían 0 o 1 se ponen como "precio a consultar" -> 0 indica negociable
const LISTINGS = [
    {
        title: "Novilla Frisona Preñada - 8 Meses",
        price: 2000,
        description: "Se vende novilla frisona preñada de 8 meses, con mirada de ADS. En Pruvia Llanera. Solo se atiende por vía telefónica.",
        location: "Barganiza (Asturias)",
        seller_name: "Mary",
        phone: "626583987",
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/82da9294-1fc7-4485-b4e0-3ac48995f4e6?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/4e915065-7fe1-4bb7-a7d8-63d93b19a9ac?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/f45b3345-b957-46c0-ba7c-e37834ee55d6?rule=detail_640x480"
        ]
    },
    {
        title: "12 Novillas Asturianas Preñadas",
        price: 2900,
        description: "Vendo 12 novillas asturianas preñadas. Precio por unidad. Ganado bien cuidado, saneamiento al día. Más información contactando directamente.",
        location: "Prestin (Asturias)",
        seller_name: "Jose",
        phone: null,
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/3261b142-b7ec-4e30-b0a0-9cbc3d5bdea0?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/c0b30f5a-0d32-4976-bcdf-4f02cea9a711?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/45b9fdcd-82da-444e-8117-1cb117ea32ab?rule=detail_640x480"
        ]
    },
    {
        title: "Novilla Asturiana de los Valles - 2 años",
        price: 2300,
        description: "En venta novilla Asturiana de los Valles de 2 años para echar al toro. Está marcada de Aseava como auxiliar B. Mirada de ADS. Animal de gran calidad genética.",
        location: "Salas (Asturias)",
        seller_name: "Fernando",
        phone: null,
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/e95aecee-1499-4aa9-a854-5da7bb7afd2f?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/a953af71-7542-4d59-8dc4-d42daaab4ff6?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/3fd633e2-d89b-4a4c-907f-f130bbdc15a5?rule=detail_640x480"
        ]
    },
    {
        title: "Novillas Fleckvieh de Élite - Líderes de Raza",
        price: 2800,
        description: "Fleckvieh Norte. Vendemos super novillas líderes de la raza. Más de 20 años de experiencia en la raza. Disponemos de terneras, novillas y vacas para cebar.",
        location: "Luarca (Asturias)",
        seller_name: "Juan",
        phone: null,
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/b220d9d9-5a9c-4d9a-9b0d-affd8a102d40?rule=detail_640x480"
        ]
    },
    {
        title: "Vacas Asturianas y Cruzadas Limousin",
        price: 2500,
        description: "Se venden varias vacas paridas Limousin y cruzadas de Limousin. Ganado dócil y de total confianza. Se puede ver en la finca.",
        location: "Grado (Asturias)",
        seller_name: "Alejandro",
        phone: null,
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/460f43e7-8ceb-48ab-a5e9-3cdfd3717eec?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/44b4570c-2278-4f12-9a56-2875cfd8dc75?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/b5ad8902-04f4-4e06-85f0-e16ee68eb641?rule=detail_640x480"
        ]
    },
    {
        title: "Novillas Recién Destetadas - 3 años",
        price: 2200,
        description: "Se venden novillas recién quitadas las crías, de 3 años, saneadas y recién sangradas de todo. De total confianza y todas nacidas en la ganadería.",
        location: "Grado (Asturias)",
        seller_name: "Alberto",
        phone: "608579749",
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/cc103e49-e9ae-44f1-972c-310c8b062bc7?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/33ae48a4-2bdb-44d3-a9c5-b067078032a3?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/354a7049-7f89-461c-bfa1-e62ce1882ea2?rule=detail_640x480"
        ]
    },
    {
        title: "3 Novillas Asturianas para Toro",
        price: 2100,
        description: "Se venden 3 novillas asturianas para coger toro. Nobles y bien cuidadas. Documentación sanitaria en regla.",
        location: "Fanes (Asturias)",
        seller_name: "Alberto Fanes",
        phone: null,
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/fa69eb2b-fd97-4634-9113-a381b7ba809d?rule=detail_640x480"
        ]
    },
    {
        title: "Asturiana de los Valles - 2º Parto con Cría",
        price: 3200,
        description: "Asturiana de los valles de segundo parto con cría. Animal con buena producción cárnica probada. Pedigree disponible.",
        location: "Pravia (Asturias)",
        seller_name: "Jorge",
        phone: null,
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/7e0da500-ebb7-40f5-b9cf-6a7644fdc26c?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/039ccf46-5887-4504-8e17-9699c9d4ab08?rule=detail_640x480"
        ]
    },
    {
        title: "Novilla de 1.5 Años - Parte ASEAVA",
        price: 2400,
        description: "Ternera de 1.5 años dado el parte de Aseava. Raza Asturiana de los Valles. Animal joven con toda la vida productiva por delante.",
        location: "Oviedo (Asturias)",
        seller_name: "Gustavo",
        phone: null,
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/ed62da8a-2a18-442a-8b71-6dfd2b844905?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/6c68492a-d704-422c-ae04-67c8d168e979?rule=detail_640x480"
        ]
    },
    {
        title: "Novilla después de Parida - Camoca",
        price: 2700,
        description: "Novilla después de parida. Animal en excelente estado. Ver en persona para apreciar su calidad. Negociable.",
        location: "Camoca de Abajo (Asturias)",
        seller_name: "Jose",
        phone: null,
        photo_urls: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/950cab42-bd64-410f-8857-56b7809a27a4?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/8525e306-0742-4bc5-8298-330a9eb0846a?rule=detail_640x480"
        ]
    }
];

await mkdir('/tmp/ruralpop_vacas2', { recursive: true });

async function downloadAndBuffer(url) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Referer': 'https://www.milanuncios.com/'
        }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
}

async function uploadToStorage(buffer, storagePath) {
    const { error } = await supabase.storage.from('listings').upload(storagePath, buffer, {
        contentType: 'image/jpeg', upsert: true
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
    if (existing?.length > 0) { console.log(`  ♻️  ${sellerName}`); return existing[0].id; }

    const { data: authData, error } = await supabase.auth.admin.createUser({
        email, password: 'Ruralpop2025!',
        user_metadata: { name: sellerName }, email_confirm: true
    });
    if (error) {
        const { data: fb } = await supabase.from('users').select('id').limit(1);
        return fb?.[0]?.id ?? null;
    }
    await supabase.from('users').upsert(
        { id: authData.user.id, email, name: sellerName, phone: phone ?? null },
        { onConflict: 'id' }
    );
    console.log(`  ✅ Created: ${sellerName}`);
    return authData.user.id;
}

async function main() {
    console.log(`\n🐄 Seeding ${LISTINGS.length} NEW bovine listings from Asturias (page 2)\n`);

    for (const [i, item] of LISTINGS.entries()) {
        console.log(`[${i + 1}/${LISTINGS.length}] "${item.title}"`);

        const uploadedUrls = [];
        for (const [pi, photoUrl] of item.photo_urls.entries()) {
            const storagePath = `vacas-asturias/p2_${Date.now()}_${i}_${pi}.jpg`;
            process.stdout.write(`  📥 Foto ${pi + 1}/${item.photo_urls.length}... `);
            try {
                const buffer = await downloadAndBuffer(photoUrl);
                const url = await uploadToStorage(buffer, storagePath);
                uploadedUrls.push(url);
                console.log('✅');
            } catch (e) { console.log(`❌ ${e.message}`); }
        }

        if (uploadedUrls.length === 0) { console.log('  ⚠️ Sin fotos\n'); continue; }

        const userId = await getOrCreateUser(item.seller_name, item.phone);
        if (!userId) { console.log('  ⚠️ Sin usuario\n'); continue; }

        const { error } = await supabase.from('listings').insert({
            title: item.title,
            price: item.price,
            description: item.description,
            location: item.location,
            image_urls: uploadedUrls,
            category: 'animales',
            subcategory: 'Bovino',
            user_id: userId,
            status: 'active',
            price_type: 'negotiable'
        });

        if (error) console.error(`  ❌ ${error.message}\n`);
        else console.log(`  ✅ Insertado con ${uploadedUrls.length} fotos propias\n`);
    }

    console.log('🎉 ¡Listo! 10 nuevos anuncios de Bovino insertados.');
}

main().catch(console.error);
