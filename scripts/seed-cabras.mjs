import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync } from 'fs';
import { mkdir } from 'fs/promises';

const SUPABASE_URL = 'https://zrpucbuvojskcwrhwevv.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const LISTINGS = [
    {
        title: "Cabra Boer de 3 Años - Posiblemente Preñada",
        price: 120,
        location: "As Pontes de Garcia Rodriguez (A Coruña)",
        description: "Se vende cabra de 3 años, posiblemente preñada de macho Boer. Muy mansa, cordea y sabe estar estacada. Animal tranquilo y fácil de manejar. Ideal para finca familiar.",
        seller_name: "Granja As Pontes",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/2787e03a-ddf7-45f5-b129-e83652bc5d3e?rule=hw396_70"
    },
    {
        title: "Cabra de 1 Año - Málaga",
        price: 100,
        location: "Málaga (Málaga)",
        description: "Cabra de un año en buenas condiciones, sana y bien alimentada. Animal joven con mucho recorrido productivo por delante. Entrega en mano en Málaga.",
        seller_name: "Granja Malagueña",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/181815cf-3ad3-44a3-b53d-32eb5c6323eb?rule=hw396_70"
    },
    {
        title: "Cabrito Rojo en Venta - Cantabria",
        price: 80,
        location: "Suances (Cantabria)",
        description: "Se vende cabrito rojo joven en muy buenas condiciones. Animal sano, desparasitado y vacunado. Perfecto para rebaño o explotación caprina.",
        seller_name: "Granja Cantábrica",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/4d537b3a-a758-4fdf-8d69-2f1f438dea46?rule=hw396_70"
    },
    {
        title: "Pareja de Cabras Andaluzas - Raza Grande",
        price: 350,
        location: "Sant Feliu de Guixols (Girona)",
        description: "Se vende una pareja de cabras andaluzas, son de raza grande. Animales robustos y productivos. Ideales para explotación lechera o cárnica. Se entregan juntos.",
        seller_name: "Explotació Girona",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/2b32d18d-1ce2-4ef5-970b-e6a28adecded?rule=hw396_70"
    },
    {
        title: "Cabra Acostumbrada a Estar Atada - Bizkaia",
        price: 90,
        location: "Balmaseda (Bizkaia)",
        description: "Se vende cabra acostumbrada a estar atada, muy tranquila y manejable. Animal sano con toda la documentación en regla. Entrega en Balmaseda o alrededores.",
        seller_name: "Baserri Bizkaia",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/073dfcae-5b74-4e50-873a-8d144fe6aedb?rule=hw396_70"
    },
    {
        title: "Cabra Boer de 5 Años - Posiblemente Preñada",
        price: 150,
        location: "A Estrada (Pontevedra)",
        description: "Disponible cabra Boer de 5 años, posiblemente preñada. Excelente raza cárnica de origen sudafricano. Animal en buen estado general. Más información por privado.",
        seller_name: "Granxa Pontevedra",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/44fcc250-02e9-428e-a908-beca0e7b4483?rule=hw396_70"
    },
    {
        title: "Cabra Preñada - A Parir en Febrero",
        price: 130,
        location: "Entrambasaguas (Cantabria)",
        description: "Se vende cabra preñada para parir en fecha próxima, sana de todo. No se aceptan ofertas ridículas. Gente seria únicamente. Más información llamando al teléfono anunciado.",
        seller_name: "Ganadería Cantabria Norte",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/6650c68b-1583-4796-9772-8e24836d4900?rule=hw396_70"
    },
    {
        title: "Cabra Enana - Chotillo de 2 Meses",
        price: 80,
        location: "Arguedas (Navarra)",
        description: "Chotillo enano de dos meses de edad, color blanco. Raza miniatura perfecta para mascotas o fincas pequeñas. Animal nacido en casa, socializado desde el primer día.",
        seller_name: "Granja Navarra",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/34a2e88a-7dcb-47a6-ad8d-4a8f4478736a?rule=hw396_70"
    },
    {
        title: "Cabra Parida con Cabrita - Asturias",
        price: 180,
        location: "Pola de Laviana (Asturias)",
        description: "Se vende cabra sana de todo, parida con una cabrita mantrina de un mes. Lote madre e hija. Animales en perfecto estado sanitario. Contactar por WhatsApp para más información.",
        seller_name: "Granja Asturiana del Norte",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/e343071b-06e9-4710-b8af-9174c8bd94a5?rule=hw396_70"
    },
    {
        title: "Macho Cabrío para Semental - Madrid",
        price: 200,
        location: "Guadalix de la Sierra (Madrid)",
        description: "Macho cabrío joven con excelente genética de raza lechera de alta producción. Muy vivo y activo. Solo para servicio como semental. Mejora garantizada de la descendencia.",
        seller_name: "Ganadería Sierra Norte",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/bf9496fe-f6aa-463a-ae73-62e339d6c9d6?rule=hw396_70"
    },
    {
        title: "Cabra Enana de 4 Meses - Pontevedra",
        price: 100,
        location: "O Porriño (Pontevedra)",
        description: "Se vende cabra enana de 4 meses de edad. Animal sano y socializado. Precio innegociable. Raza miniatura ideal para compañía o terrenos pequeños.",
        seller_name: "Granxa Pontevedra",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/058338f1-dce3-4044-b197-f0be13be7f59?rule=hw396_70"
    },
    {
        title: "Machito de Cabra Enana - Crianza a Biberón",
        price: 300,
        location: "Málaga (Málaga)",
        description: "Se vende machito de cabrita enana, muy bonito, recién nacido de una semana. Para criar a biberón. Socializado desde el nacimiento, será muy dócil y cariñoso.",
        seller_name: "Finca Malagueña",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/c59361fb-2aa6-4126-b97f-601cfafeecc6?rule=hw396_70"
    },
    {
        title: "Cabras Enanas - 2 Años - Toledo",
        price: 120,
        location: "Villasequilla (Toledo)",
        description: "Cabras enanas de 2 años. Estado perfecto, vacunadas y desparasitadas. Perfectas para terrenos o jardines. Se puede ver en persona antes de comprar.",
        seller_name: "Granja Toledana",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/4abc1af8-ab94-4598-942c-bd2ce668db0d?rule=hw396_70"
    },
    {
        title: "Cabritas Enanas Recién Nacidas - Almería",
        price: 80,
        location: "El Ejido (Almería)",
        description: "Cabritas enanas recién nacidas (17 de febrero), ideales para criar en casa o en pequeñas explotaciones. Animales sanos y de buena sangre. Entrega cuando estén destetadas.",
        seller_name: "Finca Almeriense",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/5aa43218-51be-424a-b797-d461ad78b62e?rule=hw396_70"
    },
    {
        title: "Cabra Negra de 4 Años Parida con Crías",
        price: 150,
        location: "Laredo (Cantabria)",
        description: "En venta cabra negra de 4 años, parida con dos hembras: una corza roja y otra negra. Se encuentra en Cantabria. Animal productivo y de excelente carácter.",
        seller_name: "Ganadería Cantabria",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/800f3142-9988-4086-a900-466530fc9a49?rule=hw396_70"
    },
    {
        title: "Mini Cabra de 1 Año - Ourense",
        price: 100,
        location: "Paderne de Allariz (Ourense)",
        description: "Mini cabra de un año aproximadamente. Animal muy tranquilo y manejable, acostumbrado al trato con personas. Ideal como mascota o para finca pequeña.",
        seller_name: "Granxa Ourense",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/9b0e4273-b6f5-4e7e-9fd6-6cb0d58d095d?rule=hw396_70"
    },
    {
        title: "Cabra Enana de 2 Años Parida con Crías - Lugo",
        price: 120,
        location: "Parga (Lugo)",
        description: "Se vende cabra enana de 2 años, parida con dos crías. Lote completo. Animal muy dócil y en perfectas condiciones. Posibilidad de transporte en zona.",
        seller_name: "Granja Luguesa",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/7b665df7-e836-41ae-b4bd-3f6a6e7ce376?rule=hw396_70"
    },
    {
        title: "Cabra Enana de Año y Medio - A Coruña",
        price: 90,
        location: "Val do Dubra (A Coruña)",
        description: "Se vende cabra enana de año y medio, posiblemente preñada ya que está siempre con el macho. Animal muy tranquilo y adaptado al exterior.",
        seller_name: "Granxa Coruña",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/3b9f3cd6-54ed-4749-bb47-44232077ad41?rule=hw396_70"
    },
    {
        title: "Cabras Enanas de 2 Años - Córdoba",
        price: 125,
        location: "La Carlota (Córdoba)",
        description: "Se venden cabras enanas de dos años, 125€ cada una. Animales sanos, vacunados y en perfecto estado. Raza miniatura muy apreciada como mascota y para terrenos familiares.",
        seller_name: "Ganadería Cordobesa",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/744c65f7-3e5d-4633-b799-9cf60a5bf438?rule=hw396_70"
    },
    {
        title: "Cabra con Cabrita - Cruce Enana con Chivo Grande",
        price: 140,
        location: "Obregon (Cantabria)",
        description: "Se vende cabra cruzada de enana con chivo grande, parida con una cabrita de chivo grande. Se vende el lote madre e hija. Animales sanos y bien tratados.",
        seller_name: "Cabaña Cantabria",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/77d836bc-a4c5-4a3a-8047-088a6ca6cf1b?rule=hw396_70"
    }
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
await mkdir('/tmp/ruralpop_cabras', { recursive: true });

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
    console.log(`🐐 Insertando ${LISTINGS.length} anuncios de cabras...\n`);
    let inserted = 0, failed = 0;

    for (const [idx, item] of LISTINGS.entries()) {
        console.log(`\n[${idx + 1}/${LISTINGS.length}] "${item.title}"`);

        const localPath = `/tmp/ruralpop_cabras/cabra_${idx}.jpg`;
        const storagePath = `scraped/cabras_${Date.now()}_${idx}.jpg`;
        let uploadedUrl = null;

        try {
            process.stdout.write(`  📥 Descargando imagen... `);
            const bytes = await downloadImage(item.image_url, localPath);
            process.stdout.write(`✅ (${(bytes / 1024).toFixed(1)} KB)\n`);
            process.stdout.write(`  📤 Subiendo a Supabase... `);
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
            category: 'animales',
            subcategory: 'Caprino',
            user_id: userId,
            status: 'active',
        });

        if (error) {
            console.error(`  ❌ Error al insertar: ${error.message}`);
            failed++;
        } else {
            console.log(`  ✅ Insertado! (animales / Caprino)`);
            inserted++;
        }

        await new Promise(r => setTimeout(r, 300));
    }

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`🎉 Proceso completado: ${inserted} insertados, ${failed} fallidos.`);
}

main().catch(console.error);
