import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync } from 'fs';
import { mkdir } from 'fs/promises';

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://zrpucbuvojskcwrhwevv.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── DATOS SCRAPEADOS DE MILANUNCIOS ─────────────────────────────────────────
const LISTINGS = [
    {
        title: "Cambio Oveja por Oveja - Año y Medio",
        price: 120,
        location: "Tivenys (Tarragona)",
        description: "Tiene año y medio, la cambio por otra oveja por no mezclar sangre, ya que el macho es hermano. Animal sano y bien cuidado.",
        seller_name: "Josep M.",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/5c5ec49c-b17c-4724-b8d8-af52533c995e?rule=hw396_70"
    },
    {
        title: "Ovejas en Venta - Consultar Precio",
        price: 100,
        location: "Santander (Cantabria)",
        description: "Se venden ovejas, preguntar sin compromiso. Animales sanos y en buen estado. Llamar para más información.",
        seller_name: "Carlos P.",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/94f53595-5981-4280-a743-33b7bff6087c?rule=hw396_70"
    },
    {
        title: "Oveja en Venta - Lugo",
        price: 50,
        location: "Monterroso (Lugo)",
        description: "Se vende oveja en buen estado. Animal vacunado y desparasitado. Informate sin compromiso.",
        seller_name: "Manuel G.",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/e3232c76-6507-431a-a5f7-67c0ad68ef9a?rule=hw396_70"
    },
    {
        title: "Oveja Preñada - 2 Años",
        price: 150,
        location: "Felechosa (Asturias)",
        description: "Tiene dos años, está preñada ya con fechas. Oveja sana y robusta, segunda gestación. Buen candidato para ampliar rebaño.",
        seller_name: "Roberto F.",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/cd2c7e64-b77b-4d73-a122-e151d6c5da07?rule=hw396_70"
    },
    {
        title: "Oveja Ouessant - Machos Criados a Biberón",
        price: 200,
        location: "Gandia (Valencia)",
        description: "Vendo 2 machos ouessant criados a biberón, muy cariñosos, se dejan tocar. Se vende junto o suelto a 200€ cada uno. Raza miniatura perfecta para mascotas o jardín.",
        seller_name: "Ana V.",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/27069da8-1e52-47d9-b03b-8a5e4e3b2e8b?rule=hw396_70"
    },
    {
        title: "Oveja Cruce Charoles - Buena Madre",
        price: 180,
        location: "Santiago de Compostela (A Coruña)",
        description: "Se vende oveja cruce de charoles, buena madre, segundo parto, se entrega en marzo. Animal con buenos partos y excelente producción de carne.",
        seller_name: "Pilar S.",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/a9c22ab2-9e49-4849-854a-294f1d07fc0e?rule=hw396_70"
    },
    {
        title: "Oveja Suffolk Pura - 3 Años",
        price: 230,
        location: "As Pontes de Garcia Rodriguez (A Coruña)",
        description: "Se vende oveja Suffolk pura de tres años, posiblemente preñada, con pendientes de registro. Envío fotos a interesados. Excelente raza para producción cárnica.",
        seller_name: "Diego L.",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/fbe089c1-7a6f-4173-b1c4-18f253d88c79?rule=hw396_70"
    },
    {
        title: "Comederos de Rejillas para Ovejas y Cabras",
        price: 75,
        location: "Barcarrota (Badajoz)",
        description: "Vendo comederos de rejillas 2m de ancho para ovejas y cabras. Los normales a 75 euros, los de bandeja reforzada a 80 euros. Fabricación propia, alta resistencia.",
        seller_name: "Ganadería Extremeña",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/96230dac-b6e8-444c-a189-1e455e0f64d6?rule=hw396_70"
    },
    {
        title: "Busco Oveja Carranza o Adulta",
        price: 130,
        location: "Lugo",
        description: "Busco cordera de oveja carranza o oveja adulta no muy vieja. Escuito ofertas. Mandar fotos. Zona Lugo y alrededores.",
        seller_name: "Ramón O.",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/8dc6610f-c4f2-480b-9e7d-50e7db6b0910?rule=hw396_70"
    },
    {
        title: "Oveja Assaf - Año y Medio",
        price: 190,
        location: "Ables (Asturias)",
        description: "Oveja Assaf de año y medio, raza lechera de alta producción. Animal sano, vacunado y con pedigree. Perfecta para explotaciones lecheras.",
        seller_name: "Ganadería Asturiana",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/854502f8-fda8-4fc7-b2a6-3b661473c1c5?rule=hw396_70"
    },
    {
        title: "Estiércol de Oveja - Camiones Completos",
        price: 500,
        location: "Almansa (Valencia)",
        description: "Estiércol de oveja de primera calidad. Precio por camión de 16 toneladas. Otras ubicaciones, consultar precio. Excelente abono orgánico para cultivos.",
        seller_name: "Granja La Vega",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/d8e16b11-c1c0-4a2e-9599-73ad5b2185cc?rule=hw396_70"
    },
    {
        title: "Estiércol de Oveja - Remolque 1200kg",
        price: 85,
        location: "Vallada (Valencia)",
        description: "Remolque de 1200kg de estiércol de oveja. 85€ hasta 10km. Otras ubicaciones consultar precio. Abono orgánico de alta calidad para huertos y campos.",
        seller_name: "Ganadería del Valle",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/67c6b612-59ed-407c-8972-e7a330af18c1?rule=hw396_70"
    },
    {
        title: "Oveja Cruzada - Posiblemente Preñada",
        price: 60,
        location: "Negreira (A Coruña)",
        description: "Se vende oveja posiblemente preñada, tiene pendientes, buena madre, bien de ubres. Animal sano y productivo. Para rebaño o explotación familiar.",
        seller_name: "Xosé M.",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/6c1186f4-60b2-43fb-927a-29b05b908cf0?rule=hw396_70"
    },
    {
        title: "Oveja Dorper - Intercambio por Consanguinidad",
        price: 100,
        location: "Guntin (Lugo)",
        description: "Intercambio macho o hembra Dorper para evitar consanguinidad. Tienen sobre 8 meses. Cambiaría por Dorper pura de similar edad. Zona Guntin, Lugo.",
        seller_name: "Granja Castelo",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/e8a5a5e3-339f-4e51-a58e-962789f1cd11?rule=hw396_70"
    },
    {
        title: "Esquiladora para Oveja - Nueva Sin Estrenar",
        price: 75,
        location: "Ordes (A Coruña)",
        description: "Esquiladora sin estrenar, 690W, 6 velocidades. Se puede ver y probar sin compromiso. Ideal para rebaños pequeños y medianos. Precio de venta sin usar.",
        seller_name: "Ganadería Ordes",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/195bf4ac-b570-4c9d-8a8b-148164121aa4?rule=hw396_70"
    },
    {
        title: "Oveja Dorper White - Machos Destetados",
        price: 300,
        location: "Pereira de Montes (Ourense)",
        description: "Dispongo de machos Dorper White, se entregan destetados. Excelente raza para producción cárnica, muy rústica y de bajo mantenimiento. Sangre pura.",
        seller_name: "Ganadería Do Monte",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/f316932b-c977-4303-9e84-485396e0b4c9?rule=hw396_70"
    },
    {
        title: "Oveja Lacha del Gorbea - En Vísperas de Parir",
        price: 170,
        location: "Laredo (Cantabria)",
        description: "Se vende oveja lacha del Gorbea en vísperas de parir. Raza autóctona vasca de alta producción lechera. Animal con excelente historial reproductivo.",
        seller_name: "Baserri Kantabria",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/a4134f33-0950-4918-a55a-f786763565a1?rule=hw396_70"
    },
    {
        title: "Busco Ovejas Pelibuey o Dorper - Asturias",
        price: 150,
        location: "Gijón (Asturias)",
        description: "Busco ovejas pelibuey o dorper en Asturias o Cantabria. Interesado en hembras de menos de 3 años, preferiblemente con historial reproductivo. Pago al contado.",
        seller_name: "Pablo A.",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/5267f076-8b3e-49df-8fde-0b22a569f194?rule=hw396_70"
    },
    {
        title: "Estiércol de Cabra y Oveja - Sacos y Camiones",
        price: 3,
        location: "San José de la Rinconada (Sevilla)",
        description: "Vendemos estiércol de calidad de cabra y de oveja para sacos, remolques o camiones. Excelente composición para agricultura ecológica. Contacta sin compromiso.",
        seller_name: "Granja Rinconada",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/0526e080-7f02-4bf9-b5f5-ac222177f045?rule=hw396_70"
    },
    {
        title: "Oveja de 3 Años - 2 Crías de Dos Corderos",
        price: 220,
        location: "Castellón de la Plana (Castellón)",
        description: "Oveja de 3 años y medio, ha hecho 2 crías de 2 corderos las dos veces. La vendo por quitarme animales, no por defecto. Excelente madre y buena producción.",
        seller_name: "Ramón C.",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/2a3dfd89-dbe2-494b-89c6-f4e0676b576c?rule=hw396_70"
    }
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
await mkdir('/tmp/ruralpop_ovejas', { recursive: true });

async function downloadImage(url, destPath) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Referer': 'https://www.milanuncios.com/'
        }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} al descargar ${url}`);
    const buf = Buffer.from(await response.arrayBuffer());
    writeFileSync(destPath, buf);
    return buf.length;
}

async function uploadToSupabase(localPath, storagePath) {
    const fileBuffer = readFileSync(localPath);
    const { error } = await supabase.storage
        .from('listings')
        .upload(storagePath, fileBuffer, { contentType: 'image/jpeg', upsert: true });
    if (error) throw new Error(`Upload error: ${error.message}`);
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

// Determinar categoría correcta según el título
function getCategory(title) {
    const t = title.toLowerCase();
    if (t.includes('estiercol') || t.includes('estiércol')) return 'forraje';
    if (t.includes('esquiladora') || t.includes('comedero')) return 'maquinaria';
    return 'animales'; // ✅ Categoría correcta: 'animales' (no ganado)
}

function getSubcategory(title) {
    const t = title.toLowerCase();
    if (t.includes('estiercol') || t.includes('estiércol')) return null;
    if (t.includes('esquiladora')) return null;
    if (t.includes('comedero')) return null;
    return 'Ovino'; // ✅ Subcategoría correcta bajo 'animales'
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log('🐑 Insertando 20 anuncios de ovejas en Ruralpop...\n');

    let inserted = 0;
    let failed = 0;

    for (const [idx, item] of LISTINGS.entries()) {
        console.log(`\n[${idx + 1}/20] "${item.title}"`);

        // 1. Descargar y subir la foto al bucket
        const localPath = `/tmp/ruralpop_ovejas/oveja_${idx}.jpg`;
        const storagePath = `scraped/ovejas_${Date.now()}_${idx}.jpg`;
        let uploadedUrl = null;

        try {
            process.stdout.write(`  📥 Descargando imagen... `);
            const bytes = await downloadImage(item.image_url, localPath);
            process.stdout.write(`✅ (${(bytes / 1024).toFixed(1)} KB)\n`);

            process.stdout.write(`  📤 Subiendo a Supabase... `);
            uploadedUrl = await uploadToSupabase(localPath, storagePath);
            console.log(`✅`);
        } catch (e) {
            console.log(`\n  ⚠️  Imagen fallida: ${e.message} — continuando sin foto`);
        }

        // 2. Crear/obtener usuario
        const userId = await getOrCreateUser(item.seller_name);
        if (!userId) { failed++; continue; }

        // 3. Insertar anuncio
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
            console.log(`  ✅ Anuncio insertado! (${getCategory(item.title)} / ${getSubcategory(item.title)})`);
            inserted++;
        }

        // Pequeña pausa para no saturar la API
        await new Promise(r => setTimeout(r, 300));
    }

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`🎉 Proceso completado: ${inserted} insertados, ${failed} fallidos.`);
}

main().catch(console.error);
