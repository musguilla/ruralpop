import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync } from 'fs';
import { mkdir } from 'fs/promises';

const SUPABASE_URL = 'https://zrpucbuvojskcwrhwevv.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ⚠️ Todas las fotos van al bucket 'listings' ya existente
const LISTINGS = [
    {
        title: "Gallinas Ponedoras - Isa Brown, Leghorn, Sussex y más",
        price: 12,
        location: "Salamanca (Salamanca)",
        description: "Gallinas listas para producción: Isa Brown, blanca tipo Leghorn, negra Franciscana, azul Biblue, Pedresa y tipo Sussex. Animales en plena puesta. Venta por lote o individual.",
        seller_name: "Granja Salamanca",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/ff0794bd-7518-40a3-8a2f-5c05330e71aa?rule=hw396_70"
    },
    {
        title: "Gallinas Rústicas - Extremeña Azul, Marans, Barrada",
        price: 20,
        location: "Madrid (Madrid)",
        description: "Extremeña Azul, Marans, Barrada, Franciscanas, Leghorn. Lote de varias razas muy resistentes y adaptadas al campo. Gallinas de gran rusticidad y buena producción.",
        seller_name: "Avícola Madrid",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/a83f0ecc-9a59-467d-b56d-1a0f0490a9f9?rule=hw396_70"
    },
    {
        title: "Gallinas Araucanas - Huevos Azules",
        price: 20,
        location: "Vallirana (Barcelona)",
        description: "Parejas de Araucana adultos o pollitos pequeños. Famosas por sus espectaculares huevos azules naturales. Raza sin cola, muy rústica y resistente.",
        seller_name: "Granja Barcelonesa",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/f376864d-98d5-4106-a445-634e1515375a?rule=hw396_70"
    },
    {
        title: "Pollitos de Gallina Leghorn - Raza Ponedora",
        price: 8,
        location: "Alicante (Alicante)",
        description: "Pollitos de gallina de raza Leghorn, ponedora blanca muy productiva. Recién nacidos, sexados y sanos. Vacunados frente a Marek. Excelente tasa de puesta.",
        seller_name: "Avícola Alicante",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/9f3cd1a4-c208-415e-9bf2-f0acf9d17ca6?rule=hw396_70"
    },
    {
        title: "Pareja de Gallinas Brahma - Raza Gigante",
        price: 55,
        location: "Valencia (Valencia)",
        description: "Vendo pareja de Brahma (gallo y gallina) o crías pequeñas. Las gallinas más grandes del mundo. Gran belleza y carácter tranquilo. Perfectas para finca o exposición.",
        seller_name: "Explotación Avícola Valencia",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/b6b781b4-9d0c-410d-bfd3-fc91f708fde4?rule=hw396_70"
    },
    {
        title: "Gallinas de Guinea o Pintadas - En Puesta",
        price: 30,
        location: "Sevilla (Sevilla)",
        description: "Se ofrecen gallinas de Guinea empezando a poner. Muy activas, resistentes y excelentes para control de insectos. Carne muy apreciada en gastronomía.",
        seller_name: "Granja Andaluza",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/9bd582a0-5181-414b-a9c8-754fe8995d38?rule=hw396_70"
    },
    {
        title: "Gallina y Gallo Empordanesa - Raza Autóctona Catalana",
        price: 45,
        location: "Girona (Girona)",
        description: "Gallinas y gallos de la raza Empordanesa, jóvenes y comenzando a poner. Raza autóctona catalana de doble aptitud (carne y huevo). Recuperación de raza en peligro.",
        seller_name: "Masia Catalana",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/587d0bbf-ebe5-4771-8d0a-df1602fd2494?rule=hw396_70"
    },
    {
        title: "Gallinas Brahma Gigante Blanca Armiñada",
        price: 60,
        location: "Toledo (Toledo)",
        description: "Se venden gallinas Brahma gigante blanca armiñada en negro. Las más grandes del gallinero, muy tranquilas y fáciles de manejar. Ideal para exhibición.",
        seller_name: "Granja Castellana",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/29b26a8a-52f4-4c61-9e06-165dff95e460?rule=hw396_70"
    },
    {
        title: "Pareja Gallo y Gallina Fayoumi - Egipcia Rústica",
        price: 25,
        location: "Córdoba (Córdoba)",
        description: "Disponibles parejas de gallinas Fayoumi con 7 meses de edad. Raza egipcia milenaria, muy rústica y resistente a enfermedades. Excelente agilidad y adaptación al calor.",
        seller_name: "Avícola Cordobesa",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/76da3053-0101-417c-8c9c-67753291330b?rule=hw396_70"
    },
    {
        title: "Pollitos de Gallina y Kika - Recién Nacidos",
        price: 10,
        location: "Oviedo (Asturias)",
        description: "Pollitos de gallina y de kika (gallina de guinea) muy bonitos, fuertes y sanos. Sacados de manera natural en incubadora casera. Varios colores disponibles.",
        seller_name: "Granja Asturiana",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/0e994063-acf1-4260-9271-b37d4d392f8c?rule=hw396_70"
    },
    {
        title: "Gallina Fénix Enana - Raza Cola Larga",
        price: 25,
        location: "Zaragoza (Zaragoza)",
        description: "Se vende gallina Fénix enana, ideal para ornamentación por su espectacular cola larga. Raza japonesa de gran belleza. Muy valorada en exposiciones avícolas.",
        seller_name: "Colección Avícola Aragón",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/66376245-2994-401b-9991-2021d9065aba?rule=hw396_70"
    },
    {
        title: "Pollos Raza Pekín - Miniatura Plumosa",
        price: 20,
        location: "Murcia (Murcia)",
        description: "Pollos raza Pekín sin sexar. Gallinas miniatura muy dóciles y cubiertas de plumas hasta las patas. Las favoritas para niños y aficionados. Gran temperamento.",
        seller_name: "Avicola del Sureste",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/f6b75dfe-1b2b-4f93-a80a-f46c13664121?rule=hw396_70"
    },
    {
        title: "Pollitos de Gallina de Mos - Raza Gallega",
        price: 15,
        location: "Lugo (Lugo)",
        description: "Excedentes de pollitos de Gallina de Mos, raza autóctona gallega. Buena línea de raza recuperada. Excelente calidad de carne y adaptación al clima atlántico.",
        seller_name: "Granxa Luguesa",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/c98a15e2-e36e-459f-b3c1-6a322eb58c7c?rule=hw396_70"
    },
    {
        title: "Pollo de Gallina Castellana Negra - 4 Meses",
        price: 18,
        location: "Cáceres (Extremadura)",
        description: "Pollo de gallina castellana negra de unos 4 meses de edad. Raza autóctona española de larga historia. Muy rústica, activa y productora de huevos brancos.",
        seller_name: "Finca Extremeña",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/668e8487-3a5b-4c06-bbf7-8945cab0cbbf?rule=hw396_70"
    },
    {
        title: "Gallinas Cochinchinas - Raza Asiática Ornamental",
        price: 35,
        location: "Valladolid (Valladolid)",
        description: "Se venden gallinas Cochinchinas adultas. Raza asiática de gran tamaño y plumaje en las patas. Muy dóciles, ideales para familias con niños y para exposición.",
        seller_name: "Granja Castellana",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/4c882455-a0cb-445d-9c65-cc789a50e0ca?rule=hw396_70"
    },
    {
        title: "Pavos Reales y Blancos para Finca",
        price: 120,
        location: "Badajoz (Extremadura)",
        description: "Se venden pavos reales (azules) y blancos, machos con cola completa. Perfectos para decorar fincas y jardines grandes. Animales sanos y adaptados al exterior.",
        seller_name: "Finca Extremeña",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/5c2d5c1b-05d5-4d4a-bfc3-62c978bd5ac0?rule=hw396_70"
    },
    {
        title: "Pollitas Camperas Ponedoras - 4 Meses",
        price: 14,
        location: "Granada (Granada)",
        description: "Pollitas camperas de 4 meses listas para comenzar la puesta. Criadas en libertad desde pequeñas, muy resistentes. Huevos con yema intensa por alimentación en campo.",
        seller_name: "Granja Andaluza",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/bfc47b3d-ba58-4f78-b0dc-38c8e4bc6a63?rule=hw396_70"
    },
    {
        title: "Ocas Domésticas - Guardianas de la Finca",
        price: 25,
        location: "Zamora (Castilla y León)",
        description: "Se venden ocas domésticas, excelentes guardianas del corral y la finca. Muy longevas y resistentes. Carne y hígado de alta calidad. Pesan entre 5-7 kg adultas.",
        seller_name: "Corral Zamorano",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/e6c5eb37-4a36-4d3e-9df1-92d4c3fcd9b5?rule=hw396_70"
    },
    {
        title: "Patos Criollos y de Berbería - Varios Colores",
        price: 20,
        location: "Sevilla (Andalucía)",
        description: "Patos criollos (Barberie) de varios colores: blancos, negros y moteados. Excelentes para control de insectos e ideal para estanques. Carne magra y muy sabrosa.",
        seller_name: "Corral Sevillano",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/92a28c3c-5d2b-4892-86f3-bc1a17028d48?rule=hw396_70"
    },
    {
        title: "Gallos de Combate Castizos - Para Cría",
        price: 80,
        location: "Córdoba (Andalucía)",
        description: "Se venden gallos castizos de buenas líneas, para aficionados a la cría selectiva. Gallos de gran porte, plumaje espectacular y temperamento activo. Solo para cría.",
        seller_name: "Criador Cordobés",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/a41bd3a7-fc39-4ee0-9a3f-2ef7c7af6dc9?rule=hw396_70"
    }
];

// ─── Helpers (idénticos al patrón estándar del proyecto) ─────────────────────
await mkdir('/tmp/ruralpop_aves', { recursive: true });

async function downloadImage(url, destPath) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36',
            'Referer': 'https://www.milanuncios.com/'
        }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buf = Buffer.from(await response.arrayBuffer());
    writeFileSync(destPath, buf);
    return buf.length;
}

async function uploadToSupabase(localPath, storagePath) {
    const fileBuffer = readFileSync(localPath);
    // ✅ Siempre bucket 'listings', subcarpeta scraped/
    const { error } = await supabase.storage
        .from('listings')
        .upload(storagePath, fileBuffer, { contentType: 'image/jpeg', upsert: true });
    if (error) throw new Error(error.message);
    const { data: { publicUrl } } = supabase.storage.from('listings').getPublicUrl(storagePath);
    return publicUrl;
}

async function getOrCreateUser(sellerName) {
    const clean = sellerName.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '.');
    const email = `${clean}@ruralpop.co`;

    const { data: existing } = await supabase.from('users').select('id').eq('email', email).limit(1);
    if (existing?.length > 0) {
        console.log(`  ♻️  Usuario existente: ${sellerName}`);
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
    await supabase.from('users').upsert({ id: userId, email, name: sellerName }, { onConflict: 'id' });
    console.log(`  ✅ Usuario creado: ${sellerName}`);
    return userId;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log(`🐔 Insertando ${LISTINGS.length} anuncios de avicultura...\n`);
    let inserted = 0, failed = 0;

    for (const [idx, item] of LISTINGS.entries()) {
        console.log(`\n[${idx + 1}/${LISTINGS.length}] "${item.title}"`);

        const localPath = `/tmp/ruralpop_aves/ave_${idx}.jpg`;
        const storagePath = `scraped/aves_${Date.now()}_${idx}.jpg`;
        let uploadedUrl = null;

        try {
            process.stdout.write(`  📥 Descargando imagen... `);
            const bytes = await downloadImage(item.image_url, localPath);
            process.stdout.write(`✅ (${(bytes / 1024).toFixed(1)} KB)\n`);
            process.stdout.write(`  📤 Subiendo a bucket 'listings'... `);
            uploadedUrl = await uploadToSupabase(localPath, storagePath);
            console.log(`✅`);
        } catch (e) {
            console.log(`\n  ⚠️  Imagen fallida: ${e.message}`);
        }

        const userId = await getOrCreateUser(item.seller_name);
        if (!userId) { failed++; continue; }

        const { error } = await supabase.from('listings').insert({
            title: item.title,
            price: item.price,
            description: item.description,
            location: item.location,
            image_urls: uploadedUrl ? [uploadedUrl] : [],
            category: 'animales',       // ✅ Categoría correcta
            subcategory: 'Avicultura',  // ✅ Subcategoría correcta
            user_id: userId,
            status: 'active',
        });

        if (error) {
            console.error(`  ❌ Error al insertar: ${error.message}`);
            failed++;
        } else {
            console.log(`  ✅ Insertado! (animales / Avicultura)`);
            inserted++;
        }

        await new Promise(r => setTimeout(r, 300));
    }

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`🎉 Proceso completado: ${inserted} insertados, ${failed} fallidos.`);
    console.log(`📦 Todas las imágenes en bucket 'listings/scraped/'`);
}

main().catch(console.error);
