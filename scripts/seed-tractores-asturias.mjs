import { createClient } from '@supabase/supabase-js';
import { mkdir, writeFile } from 'fs/promises';

const supabase = createClient(
    'https://zrpucbuvojskcwrhwevv.supabase.co',
    'sb_secret_zo6E6YvBYltAqRmLbmGOiA_zk3Xrt9U'
);

const LISTINGS = [
    {
        "title": "TRACTOR CORTACÉSPED STHIL - RT5097",
        "price": 2800,
        "description": "tractor, con recogedor y mulchin ( por si no se quiere recoger la hierba) como nuevo, único propietario. No vendo sin ver . Se vende en el domicilio. Se vende por no usar.",
        "location": "La Granja (S. Claudio) (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/3ff4774a-cf26-41f7-9d54-e5ff821591fe?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "TRACTOR PASQUALI - 21CV",
        "price": 12000,
        "description": "Tractocarro Pasquali 21cv. Dirección, frenos y basculante hidráulicos. Documentación en regla y remolque homologado para ITV. Impecable estado. Zona Villaviciosa. Contactar por llamada telefónica al 618166284 ( Piquero)",
        "location": "Villanueva (Sariego Villaviciosa) (Asturias)",
        "seller_name": "Manuel",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/592881f9-6a2c-4815-a63d-07cb87b3df24?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "SOLIS MINI TRACTOR - 26 PLUS",
        "price": 10618,
        "description": "Equipado con motor Mitsubishi de 26 CV, tracción 4x4, dirección hidraulica, cambio 6+2 velocidades, bloqueo de diferencial, toma de fuerza de 540 y 1000 rpm. Nuevo con 3 años de garantía oficial.",
        "location": "Aviles (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/f4c6843c-3be6-4d20-8d20-d6c6697e8e7e?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "SOLÍS MINI TRACTOR - 26+ PALA TENIAS ME",
        "price": 13855,
        "description": "Oferta del minitractor más vendido en su categoría, nuevo con 3 años de garantía oficial con Pala Tenias Me05 con engache y desenganche rapido. Motor Mitsubishi de 26 CV, tracción 4x4.",
        "location": "Miranda (Aviles) (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/3e26bf92-57a6-4fa3-bc2c-1ae0f578ef65?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "TRACTOR GOLDONI - 30 CV",
        "price": 2850,
        "description": "Se vende tractor por no usar se puede cambiar por yegua. 30 CV en buen estado.",
        "location": "San Antolin de Ibias (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/4103aa7b-e51b-40f2-a88d-3fd0faf65a19?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "MASSEY FERGUSON - 135",
        "price": 2500,
        "description": "Lote de maquinaria y tractor sin documentación ni posibilidad de ella, el lote se compone de tractor con el carro de la foto.",
        "location": "La Cuesta (Lieres Siero) (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/7f199a65-dfc6-4793-b58b-961468b28285?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "LAMBORGHINI Y SAME - R5 EVO 140 Y TOP 90",
        "price": 30000,
        "description": "Tractor Lamborghini r5 evo 140 cv, igual que el same laser 3 140, tractor mecánico entero, en buen estado.",
        "location": "Naon (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/d76c6035-2d9c-438b-a0f9-27af8c1d3b53?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "PASQUALI - 457",
        "price": 17000,
        "description": "Tractor pascuali zeus 60 caballos de año 1996 remolque con documentación tracción y basculante hidraulico y freno hidraulico.",
        "location": "Moreda de Aller (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/4b19ef5e-28b2-49e5-86d4-05b4e3b37e5b?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "MASSEY FERGUSON - 4245",
        "price": 22000,
        "description": "Se vende tractor massey ferguson con pala el leon en perfecto estado.",
        "location": "Severies (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/a945582d-4265-4ff6-bb21-cdf89b83568e?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "JOHN DEERE - 1640",
        "price": 13500,
        "description": "Se vender tractor en perfecto estado. Tiene 10mil horas, motor 4 cilindros, 4 tomas hidráulicas, tracción 4x4 desconectable.",
        "location": "Pola de Siero/Siero (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/bd39f5a3-688e-4a97-a340-8337f67a6cc6?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "AVIA - AVIA",
        "price": 4000,
        "description": "Se vende tractor avia (es el mismo que el ebro A30) Ruedas nuevas, en perfecto estado, sin documentacion.",
        "location": "La Granda (La Felguera-Langreo) (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/378ea2b8-7010-4fb1-ad22-617f91e2026b?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "AGRIA - 9900E",
        "price": 5000,
        "description": "Se vende tractor diesel de 30 CV en funcionamiento. Se incluyen aperos: arado, retrobato, cultivador, máquina de sacar patatas.",
        "location": "El Monte (Pervera Carreño) (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/d1ca6ee9-1125-4e83-8710-34a0979d15d3?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "FENDT - FARMER 106 S TURBOMATIC",
        "price": 10000,
        "description": "Tractor Fendt Farmer 106 S Turbomatic (embrague hidráulico) de 4 cilindros y 70cv, simple tracción con cabina. Con pala delantera.",
        "location": "Andrin (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/82940a20-b9bd-4fc1-a251-cea42e288bb3?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "PASQUALI - 940",
        "price": 2899,
        "description": "Tractor pasquali 940 18cv matriculado con documentacion se puede transferir. Unico dueño en perfectisimo estado.",
        "location": "Oviedo (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/0c96a83b-bec5-4c53-a734-bf54f79af213?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "LAMBORGHINI - R3 95 T",
        "price": 24500,
        "description": "Se vende Lamborghini r3, en buen estado cambio de 40 velocidades, frenos a las 4 ruedas. ITV al día.",
        "location": "Posada de Rengos (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/655daeaa-016c-4864-b1fd-3ec7cd6f68b3?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "MASSEY FERGUSON - 3060",
        "price": 15000,
        "description": "Vendo tractor Massey Ferguson 3060, de 85 cv, funciona perfectamente, ITV recién pasada hasta enero del 2027.",
        "location": "Rondiella (Llanera) (Asturias)",
        "seller_name": "Toni",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/10e777a0-3a90-4d86-b1cf-da3015d82f45?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "ISEKI - TM3160F",
        "price": 6990,
        "description": "Mini tractor Iseki de 16 CV 4x4, matriculado en 2018. Solo 1266 horas, ITV al día. Motor refrigerado por agua.",
        "location": "Aviles (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/64eab83a-214e-441e-adaf-79ea5e983630?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "SAME - SOLARIS 35 WIND",
        "price": 13500,
        "description": "Se vende tractor Same Solaris de 35 cv. En muy buen estado, con documentación al día, todos los filtros y aceites cambiados.",
        "location": "La Iglesia (Gijon) (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/2ef3fbb2-7ad1-4b0a-89f0-2fe5ee23cf93?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "TRACTOR MACKORMIK - 105cv",
        "price": 15000,
        "description": "Tractor Mackormik de 105cv con rotovato. En buen estado de funcionamiento.",
        "location": "Oviedo (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/e0f13bb2-a218-4d1b-b94f-55c334897602?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "ANTONIO CARRARO - 5400 TIGRONE",
        "price": 15000,
        "description": "Usado en muy buen estado. Todo homologado y con documentacion. 50 CV motor diésel.",
        "location": "Ciudad Residencial de Perlora (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/c1fffaa6-9078-416a-8735-b4a155cf0e7b?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "PASQUALI - 18 CV",
        "price": 2950,
        "description": "El pasquali que menos trabajó de España ruedas originales de la casa, velocidad larga. Totalmente de origen.",
        "location": "Tineo (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/2a81e467-0c74-4187-b552-dc09358ebb95?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "DEUTZ FAHR - AGROTRON 135 MK3",
        "price": 38000,
        "description": "Se vende deutz fahr agrotorn 135 mk3 en muy buen estado, año 2004 con 7000 horas.",
        "location": "Gijón (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/aa0ba782-6d54-4456-8223-ea85b5084ea8?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "UTB - UNIVERSAL 350 DT",
        "price": 10500,
        "description": "Vendo tractor UTB 350 DT tres cilindros de doble tracción y dirección hidráulica con ITV al día. Incluye remolque.",
        "location": "Fresno (Ribadesella) (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/1e805b39-d095-4df6-85f4-b4059a8c4c46?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "PASCUALI 940 - PASCUALI 940",
        "price": 2000,
        "description": "Se vende Pascuali 940 14 CV en buen estado, funcionando todo perfectamente mejor ver en Oviedo.",
        "location": "Oviedo (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/a165db09-d730-4648-b31b-dc0c68ab222f?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "SOLIS MINI TRACTOR - 26 XL SHUTTLE NUEVO",
        "price": 11847,
        "description": "Oferta especial Solis S26 Shuttle XL con inversor. Motor Mitsubishi 26 CV, cambio 9+9 con inversor sincronizado.",
        "location": "Aviles (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/dfc001f3-9058-4571-b6ad-d046fca35605?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "TRACTOR CORTACÉSPED CUBCADET",
        "price": 1200,
        "description": "Vendo tractor cortacésped cubcadet transmatico 6 velocidades. Finca particular único propietario.",
        "location": "Novalin (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/e6d5a711-0f80-49aa-a3d1-744c4036901c?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "TRACTOR STIHL SEMINUEVO",
        "price": 2800,
        "description": "tractor stihl, 90cm de corte, motor bicilindrico, correa nueva, costó 5000€.",
        "location": "La Magdalena (Cudillero) (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/a00177f1-024e-4cbf-a50e-b13360ffa663?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "REMOLQUE TRACTOR",
        "price": 1900,
        "description": "Se vende remolque en muy buen estado y fuerte con tracción y freno además con cardan.",
        "location": "Cangas de Narcea (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/ff53b91a-ef0d-4b55-a714-015752976f9b?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "REMOLQUE TRACTOR AGRIA",
        "price": 1750,
        "description": "Se vende remolque para agria 9900. Tracción mecánica y basculante hidráulico.",
        "location": "Pola de Siero/Siero (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/8a327179-4d5a-4a4a-9ac9-ad6cedf6a05e?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    },
    {
        "title": "BIVALVA PARA TRACTOR",
        "price": 1000,
        "description": "Bivalva para plumas de tracto de 50 por 80 en perfecto estado de funcionamiento.",
        "location": "Redespines (Asturias)",
        "seller_name": "Particular",
        "photo_urls": ["https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/7870b741-9d1c-410c-a649-9847c7981e24?rule=detail_640x480"],
        "category": "maquinaria",
        "subcategory": "Tractores"
    }
];

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

async function getOrCreateUser(sellerName) {
    const clean = sellerName.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '.');
    const suffix = Math.floor(Math.random() * 10000);
    const email = `${clean}${suffix}@ruralpop.co`;

    const { data: authData, error } = await supabase.auth.admin.createUser({
        email,
        password: 'Ruralpop2025!',
        user_metadata: { name: sellerName },
        email_confirm: true
    });

    if (error) {
        console.error(`  ❌ Auth error: ${error.message}`);
        const { data: fb } = await supabase.from('users').select('id').limit(1);
        return fb?.[0]?.id ?? null;
    }

    await supabase.from('users').upsert(
        { id: authData.user.id, email, name: sellerName },
        { onConflict: 'id' }
    );
    return authData.user.id;
}

async function main() {
    console.log(`🚜 Seeding ${LISTINGS.length} PRECISE tractor listings from Asturias\n`);

    const TEMP_DIR = '/tmp/ruralpop_tractores_v2';
    await mkdir(TEMP_DIR, { recursive: true });

    for (const [i, item] of LISTINGS.entries()) {
        console.log(`\n[${i + 1}/${LISTINGS.length}] "${item.title}" - ${item.price}€`);

        const uploadedUrls = [];
        for (const [pi, photoUrl] of item.photo_urls.entries()) {
            const fileName = `tractor_precise_${Date.now()}_${i}_${pi}.jpg`;
            const localPath = `${TEMP_DIR}/${fileName}`;
            const storagePath = fileName;

            process.stdout.write(`  📥 Photo ${pi + 1}... `);
            try {
                const buffer = await downloadImage(photoUrl, localPath);
                const url = await uploadToStorage(buffer, storagePath);
                uploadedUrls.push(url);
                console.log('✅');
            } catch (e) {
                console.log(`❌ ${e.message}`);
            }
        }

        const userId = await getOrCreateUser(item.seller_name);
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

        if (error) console.error(`  ❌ Insert error: ${error.message}`);
        else console.log(`  ✅ Inserted successfully`);
    }

    console.log('\n🎉 Done!');
}

main().catch(console.error);
