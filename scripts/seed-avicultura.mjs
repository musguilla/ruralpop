import { createClient } from '@supabase/supabase-js';
import { mkdir, writeFile } from 'fs/promises';

// Uso de entorno: export SUPABASE_SERVICE_ROLE_KEY=sb_secret_XXX ...
const SUPABASE_URL = 'https://zrpucbuvojskcwrhwevv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_KEY) {
    console.error("⚠️ FALTA LA CLAVE: Exporta SUPABASE_SERVICE_ROLE_KEY antes de correr el script.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const LISTINGS = [
    {
        "title": "Pollitos gallina de Mos",
        "price": 3,
        "description": "Dispongo de pollitos de gallina de Mos. Recién nacidos a 3€ y 1€ más por cada semana de vida que tengan. Excelentes reproductores, se pueden ver sin compromiso.",
        "location": "Lugo", // Mejorada a Lugo porque es raza típica gallega
        "seller_name": "Criador de Mos",
        "phone": null,
        "photo_urls": [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/92e5ba7b-f77d-4035-b80b-d3c97225d185?rule=detail_640x480"
        ],
        "category": "ganaderia",
        "subcategory": "Avicultura"
    },
    {
        "title": "Gallina Sedosa",
        "price": 20,
        "description": "Huevos fértiles para incubar de gallinas sedosas en color chocolate, Lila y negro sólido. Se hacen envíos por agencia. \nDisponibles parejas jovenes en diferentes edades y colores.",
        "location": "Madrid",
        "seller_name": "Avicultura Sedosa",
        "phone": null,
        "photo_urls": [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/43ca7a76-5a69-4271-8292-0fa9f104b570?rule=detail_640x480"
        ],
        "category": "ganaderia",
        "subcategory": "Avicultura"
    },
    {
        "title": "Huevos caseros de gallina",
        "price": 3,
        "description": "🥚 HUEVOS CASEROS DE GALLINA – PONTEVEDRA / ARCADE\n\nHuevos frescos de producción propia.\n\nGallinas con acceso a finca y alimentación variada (pienso, grano y calcio).\nGallinero registrado en REGA (Galicia).\n\n📦 Precios:\n• Docena: 3 €\n• Media docena: 1,80 €\n• Sueltos: 0,30 €/unidad",
        "location": "Pontevedra",
        "seller_name": "Granja Arcade",
        "phone": null,
        "photo_urls": [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/73a58457-1244-4df5-b071-0e7c20b4d9c5?rule=detail_640x480"
        ],
        "category": "ganaderia",
        "subcategory": "Avicultura"
    },
    {
        "title": "Pollitos de Gallina y de Kika",
        "price": 5,
        "description": "Pollitos de Gallina ly de Kikas muy bonitos fuertes and sanos.\nSacados de manera natural por su Madre kika.\nSe pueden ver sin compromiso \nTlf 635476912\nPrecio 5 Euros cada uno",
        "location": "Cantabria",
        "seller_name": "Criador Cantabria",
        "phone": "635476912",
        "photo_urls": [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/0e994063-acf1-4260-9271-b37d4d392f8c?rule=detail_640x480"
        ],
        "category": "ganaderia",
        "subcategory": "Avicultura"
    },
    {
        "title": "huevos fertiles de gallina",
        "price": 12,
        "description": "Huevos fertiles de gallina:\nSUSEX \nAYAM CEMANY \nMARRADUNE \nMOS\nLEGORH \nPITA PINTA ASTURIANA \nPEDRESAS \nCUELLO PELADO \nKIKAS \nSE ENVÍA A TODA ESPAÑA \n680440648",
        "location": "Asturias",
        "seller_name": "Huevos Fertiles ES",
        "phone": "680440648",
        "photo_urls": [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/2330b9c2-560f-4b23-83b0-6ed9929c0221?rule=detail_640x480"
        ],
        "category": "ganaderia",
        "subcategory": "Avicultura"
    },
    {
        "title": "Pollitos de gallina campera",
        "price": 4,
        "description": "Pollitos de gallinas camperas , perfectas para doble proposito , buena carne y una puesta de 270 huevos anuales \nSe hacen envios a domicilio",
        "location": "Zamora",
        "seller_name": "Camperas Zamora",
        "phone": null,
        "photo_urls": [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/1a435645-c641-41e1-b8ff-479ded662590?rule=detail_640x480"
        ],
        "category": "ganaderia",
        "subcategory": "Avicultura"
    },
    {
        "title": "GALLINA FÉNIX ENANA",
        "price": 25,
        "description": "Se vende gallina Fénix enana.\nNo tengo WhatsApp así que respondo por aquí.",
        "location": "A Coruña",
        "seller_name": "Criador Fénix",
        "phone": null,
        "photo_urls": [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/66376245-2994-401b-9991-2021d9065aba?rule=detail_640x480"
        ],
        "category": "ganaderia",
        "subcategory": "Avicultura"
    },
    {
        "title": "Huevos de gallina Leghorn",
        "price": 15,
        "description": "Huevos fertiles de raza de gallina Leghorn \nTambien tengo pollitos a 5€",
        "location": "Barcelona",
        "seller_name": "Avicola BCN",
        "phone": null,
        "photo_urls": [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/c60909fc-28a3-48e3-a7f6-7a906c28ae37?rule=detail_640x480"
        ],
        "category": "ganaderia",
        "subcategory": "Avicultura"
    },
    {
        "title": "HUEVOS GALLINA DE GUINEA",
        "price": 12,
        "description": "HUEVOS GALLINAS DE GUINEA FERTILES. EL MACHO ES BLANCO Y LAS HEMBRAS PINTADAS.",
        "location": "Sevilla",
        "seller_name": "Guinea Fowl CS",
        "phone": null,
        "photo_urls": [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/569bad27-8110-4e52-ba64-ba9c264eebcc?rule=detail_640x480"
        ],
        "category": "ganaderia",
        "subcategory": "Avicultura"
    },
    {
        "title": "Huevos de gallina utrerana",
        "price": 10,
        "description": "Huevos fértiles para cría de gallina andaluza utrerana pluma aperdizada,el precio es de una docena (NO SE ENVÍAN). Recogida en Conil .",
        "location": "Cádiz",
        "seller_name": "Utreranas Sur",
        "phone": null,
        "photo_urls": [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/267d6b70-01a2-4a15-aa6c-74d1b4bee80a?rule=detail_640x480"
        ],
        "category": "ganaderia",
        "subcategory": "Avicultura"
    },
    {
        "title": "gallina mascara de hierro",
        "price": 80,
        "description": "Se venden parejas mas info privado",
        "location": "Valencia",
        "seller_name": "Exoticas VLC",
        "phone": null,
        "photo_urls": [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/a53ee037-41ef-41f3-9d66-115cde589909?rule=detail_640x480"
        ],
        "category": "ganaderia",
        "subcategory": "Avicultura"
    },
    {
        "title": "huevos de gallina fertiles",
        "price": 7,
        "description": "huevos fértiles ,\nmuy buenas fertilidad\n12 de gallina 7€\n12 de codorniz 5€\nenvíos a toda españa",
        "location": "Zaragoza",
        "seller_name": "OvoZgz",
        "phone": null,
        "photo_urls": [
            "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/2c8bdf8e-29e8-44d9-b960-0dda348e7a43?rule=detail_640x480"
        ],
        "category": "ganaderia",
        "subcategory": "Avicultura"
    }
];

await mkdir('/tmp/ruralpop_avicultura', { recursive: true });

async function downloadImage(url, destPath) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
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
        .upload(storagePath, buffer, { contentType: 'image/jpeg', upsert: true });
    if (error) throw new Error(error.message);
    return supabase.storage.from('listings').getPublicUrl(storagePath).data.publicUrl;
}

async function getOrCreateUser(sellerName, phone) {
    const clean = sellerName.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '.');
    const email = `${clean}_${Date.now()}@ruralpop.co`;

    const { data: authData, error } = await supabase.auth.admin.createUser({
        email, password: 'Ruralpop2025!',
        user_metadata: { name: sellerName },
        email_confirm: true
    });

    if (error) {
        console.error(`  ❌ Auth error for ${sellerName}: ${error.message}`);
        const { data: fb } = await supabase.from('users').select('id').limit(1);
        return fb?.[0]?.id ?? null;
    }

    await supabase.from('users').upsert(
        { id: authData.user.id, email, name: sellerName, phone: phone ?? null },
        { onConflict: 'id' }
    );
    console.log(`  ✅ Created user: ${sellerName} (${email}) - Tel: ${phone || 'Ninguno'}`);
    return authData.user.id;
}

async function main() {
    console.log(`🐔 Empezando el Seeding de ${LISTINGS.length} anuncios de Avicultura\n`);

    const { error: bErr } = await supabase.storage.createBucket('listings', { public: true });
    if (bErr && !bErr.message.includes('already exists')) console.warn('Bucket:', bErr.message);

    for (const [i, item] of LISTINGS.entries()) {
        console.log(`\n[${i + 1}/${LISTINGS.length}] "${item.title}"`);

        const uploadedUrls = [];
        for (const [pi, photoUrl] of item.photo_urls.entries()) {
            const localPath = `/tmp/ruralpop_avicultura/ave_${i}_${pi}.jpg`;
            const storagePath = `avicultura/ave_${Date.now()}_${i}_${pi}.jpg`;
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

        if (uploadedUrls.length === 0 && item.photo_urls.length > 0) {
            console.log('  ⚠️ Fotos fallaron — skipping'); continue;
        }

        const userId = await getOrCreateUser(item.seller_name, item.phone);
        if (!userId) { console.log('  ⚠️ Sin usuario — skipping'); continue; }

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

        if (error) console.error(`  ❌ Insert error: ${error.message}`);
        else console.log(`  ✅ Insertado correctamente en Avicultura`);
    }

    console.log('\n🎉 ¡PROCESO DE SCRAPE E IMPORTACIÓN (AVICULTURA) COMPLETADO CON EXITO!');
}

main().catch(console.error);
