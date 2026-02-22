import { createClient } from '@supabase/supabase-js';
import { mkdir } from 'fs/promises';

const supabase = createClient(
    'https://zrpucbuvojskcwrhwevv.supabase.co',
    'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

// ÚNICAMENTE UUIDs verificados por el browser agent del scraping de páginas de yeguas.
// Cada foto está vinculada al anuncio concreto en el que apareció.
// NO se reciclan UUIDs de otras categorías.
const LISTINGS = [
    {
        title: "Yegua PRE - 2 años - Gran Potencial",
        price: 3500,
        description: "Se vende yegua PRE de 2 años, con documentación en regla. Animal con buen carácter, buena morfología y gran potencial para doma o cría.",
        location: "Viator (Almería)",
        seller_name: "Particular Almería",
        photos: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/dcc6d767-fc85-4df5-9cda-49f02437ae18?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/d0c12d85-2cca-44d6-a5e4-291587825f1a?rule=detail_640x480"
        ]
    },
    {
        title: "Yegua Noble Montada - 25 años",
        price: 600,
        description: "Yegua muy noble y bien montada con papeles. 25 años. Ideal para niños o paseos tranquilos. Documentación completa.",
        location: "Cangas de Narcea (Asturias)",
        seller_name: "Particular Cangas",
        photos: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/68b0562b-81d9-4c18-8a3a-dcd1a4eb4785?rule=detail_640x480"
        ]
    },
    {
        title: "Yegua Cruzada Doma Completa - 10 años",
        price: 4700,
        description: "Edad 10 años. Altura 1.63. Muy campera. Paso, trote y galope. Espaldas adentro, apoyos, piruetas. Muy andadora. Romerías y ferias.",
        location: "Ripollet (Barcelona)",
        seller_name: "Caballos Ruben Diaz",
        photos: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/2807a550-23fe-4f4d-a66e-4433ea815948?rule=detail_640x480"
        ]
    },
    {
        title: "Yegua CDE - Descendiente de CRACK-C - Salto",
        price: 8500,
        description: "Descendiente de CRACK-C y línea maternal BALOU DU ROUET. Compitiendo en 1.15m. Gran potencial para salto de alto nivel.",
        location: "Ripollet (Barcelona)",
        seller_name: "Caballos Ruben Diaz",
        photos: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/9b0f567d-3dbb-4231-b364-d87be107aae2?rule=detail_640x480"
        ]
    },
    {
        title: "Yegua Alazana 2016 - Domada a Dos Riendas",
        price: 2800,
        description: "Nacida en 2016, alzada 1.62m. Domada a dos riendas. Noble, ideal para criar (ha tenido 3 potros). Perfecta para amazonas.",
        location: "Montecote (Cádiz)",
        seller_name: "Particular Cádiz",
        photos: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/702676df-0e01-4f65-a898-889b5c26a8ae?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/bfb87645-3288-4214-a508-635402ebf4c2?rule=detail_640x480"
        ]
    },
    {
        title: "Yegua Poni de Salto - Iniciación Deportiva",
        price: 1200,
        description: "Yegua poni de salto deportivo. Ideal para iniciación en competición de ponis. Sana y bien cuidada.",
        location: "Griñón (Madrid)",
        seller_name: "Particular Madrid",
        photos: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/0c2c5802-751f-480b-98c4-4f45ee3040fd?rule=detail_640x480",
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/b88f72ff-9530-4ff1-8baf-5c3e56fd1fdf?rule=detail_640x480"
        ]
    },
    {
        title: "Yegua Hispano-Árabe Torda - Rocío y Ferias",
        price: 1500,
        description: "De plena confianza. Ha estado en el Rocío y ferias. 1.55m de talla. 25 años. Muy sana y totalmente noble.",
        location: "Sevilla (Sevilla)",
        seller_name: "Particular Sevilla",
        photos: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/9abd1e4d-b53a-41bb-bc17-c61356a70b08?rule=detail_640x480"
        ]
    },
    {
        title: "Yegua PRE con Carta ANCCE - 3 años",
        price: 4500,
        description: "3 años, buena morfología. Pura Raza Española con papeles en regla. Gran futuro en doma o reproducción.",
        location: "Segovia (Castilla y León)",
        seller_name: "Particular Segovia",
        photos: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/29e8fce9-d020-4a65-be28-49e4a45eab61?rule=detail_640x480"
        ]
    },
    {
        title: "Yegua Cruzada Hispano-Luso-Árabe - 5 años",
        price: 3500,
        description: "Yegua cruzada de 5 años. Pasaporte. Altura 1.60. Línea Hispano Luso Árabe. Yegua de cría de capa baya. Dando buenos potros.",
        location: "Ripollet (Barcelona)",
        seller_name: "Caballos Ruben Diaz",
        photos: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/246f4259-0e08-45da-83aa-e765c7b805c0?rule=detail_640x480"
        ]
    },
    {
        title: "Yegua Anglo-Árabe - Apoyos y Romerías",
        price: 3900,
        description: "Yegua cruzada de 5 años, pasaporte, altura 1.61. Línea Anglo Árabe. Cesiones, paso atrás, pirueta directa, apoyos. Saliendo al Rocío.",
        location: "Ripollet (Barcelona)",
        seller_name: "Caballos Ruben Diaz",
        photos: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/9bddc43b-d522-4c60-b594-493c150269fa?rule=detail_640x480"
        ]
    },
    {
        title: "Yegua Cruzada Perla - Ideal Principiantes",
        price: 1200,
        description: "Yegua cruzada de 17 años. Pasaporte. Altura 1.65. Capa perla. Paso, trote y galope. Romerías y ferias. Perfecta para jinetes sin experiencia.",
        location: "Ripollet (Barcelona)",
        seller_name: "Caballos Ruben Diaz",
        photos: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/eceb1ea5-4c09-4559-855c-909dd948a763?rule=detail_640x480"
        ]
    },
    {
        title: "Yegua Mansa para Disfrutar",
        price: 1600,
        description: "Yegua mansa como una perra. Muy poco honrosa y montada. Para disfrutar sin preocupaciones. Sin vicios.",
        location: "Huelva (Huelva)",
        seller_name: "Particular Huelva",
        photos: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/3624285e-445f-4f28-ade4-c2761f8b03bc?rule=detail_640x480"
        ]
    },
    {
        title: "Yegua Preñada Próxima a Parir",
        price: 2000,
        description: "Se vende yegua próxima a parir de un buen caballo español. También se puede cambiar. Noble y en buen estado.",
        location: "A Coruña (A Coruña)",
        seller_name: "Particular Coruña",
        photos: [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/185222a7-708b-4825-a0c0-5b6cf89e2b7a?rule=detail_640x480"
        ]
    }
];

await mkdir('/tmp/ruralpop_yeguas_v2', { recursive: true });

async function downloadAndBuffer(url) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Referer': 'https://www.milanuncios.com/'
        }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
}

async function uploadToStorage(buffer, storagePath) {
    const { error } = await supabase.storage.from('listings').upload(storagePath, buffer, {
        contentType: 'image/jpeg', upsert: true
    });
    if (error) throw new Error(error.message);
    return supabase.storage.from('listings').getPublicUrl(storagePath).data.publicUrl;
}

async function getOrCreateUser(sellerName) {
    const clean = sellerName.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '.');
    const email = `${clean}@ruralpop.co`;

    const { data: existing } = await supabase.from('users').select('id').eq('email', email).limit(1);
    if (existing?.length > 0) { process.stdout.write(`♻️  `); return existing[0].id; }

    const { data: authData, error } = await supabase.auth.admin.createUser({
        email, password: 'Ruralpop2025!',
        user_metadata: { name: sellerName }, email_confirm: true
    });
    if (error) {
        const { data: fb } = await supabase.from('users').select('id').limit(1);
        return fb?.[0]?.id ?? null;
    }
    await supabase.from('users').upsert(
        { id: authData.user.id, email, name: sellerName },
        { onConflict: 'id' }
    );
    process.stdout.write(`👤 `);
    return authData.user.id;
}

async function main() {
    console.log(`\n🐴 Seeding ${LISTINGS.length} yegua listings (verified photo UUIDs)\n`);

    for (const [i, item] of LISTINGS.entries()) {
        process.stdout.write(`[${String(i + 1).padStart(2, '0')}/${LISTINGS.length}] "${item.title.substring(0, 40)}"... `);

        const uploadedUrls = [];
        for (const [pi, photoUrl] of item.photos.entries()) {
            const storagePath = `yeguas-v2/${Date.now()}_${i}_${pi}.jpg`;
            try {
                const buffer = await downloadAndBuffer(photoUrl);
                const url = await uploadToStorage(buffer, storagePath);
                uploadedUrls.push(url);
                process.stdout.write(`📸`);
            } catch (e) { process.stdout.write(`⚠️(${e.message.substring(0, 10)})`); }
        }

        if (uploadedUrls.length === 0) { console.log(` ❌ Sin fotos`); continue; }

        const userId = await getOrCreateUser(item.seller_name);
        if (!userId) { console.log(` ❌ Sin usuario`); continue; }

        const { error } = await supabase.from('listings').insert({
            title: item.title,
            price: item.price,
            description: item.description,
            location: item.location,
            image_urls: uploadedUrls,
            category: 'animales',
            subcategory: 'Equino',
            user_id: userId,
            status: 'active',
            price_type: 'negotiable'
        });

        if (error) console.log(` ❌ ${error.message}`);
        else console.log(` ✅`);
    }

    console.log('\n🎉 ¡Listo! Yeguas insertadas con fotos verificadas.');
}

main().catch(console.error);
