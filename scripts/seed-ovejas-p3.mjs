import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync } from 'fs';
import { mkdir } from 'fs/promises';

const SUPABASE_URL = 'https://zrpucbuvojskcwrhwevv.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Solo anuncios ganaderos reales con imagen disponible
const LISTINGS = [
    {
        title: "Ovejas en Venta - Lote 40 Cabezas Preñadas",
        price: 125,
        location: "Aznalcazar (Sevilla)",
        description: "Se venden cuarenta ovejas y dos machos. Están preñadas algunas para parir pronto. Lote completo a buen precio. Animales sanos y bien cuidados.",
        seller_name: "Ganadería Aznalcazar",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/508f4d80-9091-429e-9460-b7d0dc8e6929?rule=hw396_70"
    },
    {
        title: "Ovejas Pelibuey de Pura Raza - Muy Seleccionadas",
        price: 150,
        location: "Haro (La Rioja)",
        description: "Se venden ovejas Pelibuey de pura raza, muy seleccionadas. Raza de pelo, sin lana, excelente para producción cárnica en climas cálidos. Alta fertilidad.",
        seller_name: "Granja La Rioja",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/2ffd2219-0b10-4556-8cce-1e3fd86ca250?rule=hw396_70"
    },
    {
        title: "Oveja de 7 Años - A Punto de Parir",
        price: 80,
        location: "Ormaiztegi (Gipuzkoa)",
        description: "Oveja de 7 años para parir en 15 días. Animal experimentado, excelente madre con buen historial reproductivo. Entrega inmediata.",
        seller_name: "Baserri Gipuzkoa",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/fa693673-379c-4122-929e-04e9a553ce14?rule=hw396_70"
    },
    {
        title: "2 Ovejas Cruzadas con Corderos Incluidos",
        price: 100,
        location: "Santiago de Compostela (A Coruña)",
        description: "Se venden 2 ovejas cruzadas, 100€ cada una. Si se llevan las dos, 175€. Este año sacaron una dos corderos y la otra uno. Los corderos de momento no se venden por separado.",
        seller_name: "Granxa Santiago",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/b2c56675-e34b-459b-8525-a6573821a7f2?rule=hw396_70"
    },
    {
        title: "Corderos y Ovejas para Carne",
        price: 150,
        location: "Baños de la Encina (Jaén)",
        description: "Se venden corderos y ovejas para carne. Animales de primera calidad, bien alimentados y en perfecto estado sanitario. Lote o precio por cabeza.",
        seller_name: "Granja Jaén",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/51937356-1645-4ce7-b631-56393c2883ef?rule=hw396_70"
    },
    {
        title: "Ovejas en Venta - Gran Canaria",
        price: 150,
        location: "Telde (Las Palmas)",
        description: "Vendo ovejas a 150 euros por cabeza. Animales sanos y en buen estado. Contactar por teléfono para más información y acordar visita.",
        seller_name: "Granja Canaria",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/76a7e51c-f5c3-4bc8-837f-c137ccc8ea70?rule=hw396_70"
    },
    {
        title: "Lote 2 Ovejas y 3 Corderos - Venta Conjunta",
        price: 250,
        location: "Santa Leocadia (Lugo)",
        description: "Vendo el lote completo: 2 ovejas y 3 corderos. Precio por el conjunto. Animales sanos, vacunados y bien alimentados. Contacto por WhatsApp.",
        seller_name: "Granxa Lugo",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/c7d6609b-bdbe-41d0-a603-0548d6481805?rule=hw396_70"
    },
    {
        title: "Ovejas Ouessant - Raza Enana Francesa",
        price: 100,
        location: "Langreo (Asturias)",
        description: "Ovejas enanas raza francesa Ouessant. Ya destetadas. Perfectas para fincas pequeñas, jardines o como mascotas. Muy dóciles y fáciles de manejar. Raza protegida.",
        seller_name: "Cabaña Asturiana",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/0a5d15ca-d288-48ca-bd55-e8020366df27?rule=hw396_70"
    },
    {
        title: "Carnero Raza Enana - Suances",
        price: 80,
        location: "Suances (Cantabria)",
        description: "Carnero de raza enana, ideal para finca pequeña o como mascota. Animal manso y fácil de manejar. Perfectamente adaptado al clima cantábrico.",
        seller_name: "Granja Cantabria",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/252c5adf-4a7d-4653-aba9-ad212402d6bc?rule=hw396_70"
    },
    {
        title: "Rebaño de 300 Ovejas Fechas Puras",
        price: 90,
        location: "Brazatortas (Ciudad Real)",
        description: "Vendo 300 ovejas fechas puras para parir en agosto. Todos sus papeles en regla. Excelente rebaño para quien quiera comenzar o ampliar una explotación ovina profesional.",
        seller_name: "Ganadería Ciudad Real",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/455a11f5-7178-4072-a8ed-4a2cdf1579f6?rule=hw396_70"
    },
    {
        title: "Servicio de Rapado de Ovejas - Galicia",
        price: 4,
        location: "Lugo (Lugo)",
        description: "Servicio profesional de rapado (esquilado) de ovejas. Atendemos toda Galicia. Precios competitivos por cabeza. Experiencia y maquinaria propia. Llamar para presupuesto.",
        seller_name: "Esquila Gallega",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/05afb88f-0d53-4b69-bdc3-6f1c4a9910a9?rule=hw396_70"
    }
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
await mkdir('/tmp/ruralpop_ovejas2', { recursive: true });

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

function getCategory(title) {
    const t = title.toLowerCase();
    if (t.includes('rapado') || t.includes('esquila')) return 'maquinaria';
    return 'animales';
}

function getSubcategory(title) {
    const t = title.toLowerCase();
    if (t.includes('rapado') || t.includes('esquila')) return null;
    return 'Ovino';
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log(`🐑 Insertando ${LISTINGS.length} anuncios de ovejas (página 3)...\n`);
    let inserted = 0, failed = 0;

    for (const [idx, item] of LISTINGS.entries()) {
        console.log(`\n[${idx + 1}/${LISTINGS.length}] "${item.title}"`);

        const localPath = `/tmp/ruralpop_ovejas2/oveja_${idx}.jpg`;
        const storagePath = `scraped/ovejas_p3_${Date.now()}_${idx}.jpg`;
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
            category: getCategory(item.title),
            subcategory: getSubcategory(item.title),
            user_id: userId,
            status: 'active',
        });

        if (error) {
            console.error(`  ❌ Error al insertar: ${error.message}`);
            failed++;
        } else {
            console.log(`  ✅ Insertado! (${getCategory(item.title)} / ${getSubcategory(item.title) ?? '-'})`);
            inserted++;
        }

        await new Promise(r => setTimeout(r, 300));
    }

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`🎉 Proceso completado: ${inserted} insertados, ${failed} fallidos.`);
}

main().catch(console.error);
