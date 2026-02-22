import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync } from 'fs';
import { mkdir } from 'fs/promises';

const SUPABASE_URL = 'https://zrpucbuvojskcwrhwevv.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ⚠️ IMPORTANTE: todas las fotos van al bucket 'listings' ya existente, NO se crea ningún bucket nuevo.
const LISTINGS = [
    {
        title: "Cerdo para Matanza - Criado en Prao con Harina",
        price: 300,
        location: "Corvera de Toranzo (Cantabria)",
        description: "Se vende cerdo capado, criado en prao paciendo y rematado con harina, todo natural. Alimentación 100% tradicional. Excelente calidad de carne para matanza familiar.",
        seller_name: "Granja Cantabria Norte",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/e49b56ca-54b5-454b-a14d-ab9d5bfb7390?rule=hw396_70"
    },
    {
        title: "Cerdo para Matanza - Criado en Entorno Natural",
        price: 500,
        location: "Talavera de la Reina (Toledo)",
        description: "Se vende cerdo criado en entorno natural, alimentado con pienso, fruta, verduras y cereales de calidad. Listo para la matanza. Excelente relación calidad-precio.",
        seller_name: "Granja Talavera",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/b308d74e-227e-48ab-ba03-031f78a95436?rule=hw396_70"
    },
    {
        title: "Cerda de 10 Meses Criada en Campo",
        price: 250,
        location: "Casar de Periedo (Cantabria)",
        description: "Se vende hembra de 10 meses criada en el campo. Animal sano y bien desarrollado. Precio a convenir según peso. Contacto por teléfono.",
        seller_name: "Ganadería Cantabria",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/0baa1fd3-da4a-4fcf-8549-87f609f285dc?rule=hw396_70"
    },
    {
        title: "Guarín (Cerdo Enano) - 1 Año",
        price: 120,
        location: "Lucena (Córdoba)",
        description: "Guarín de 1 año, raza que no crece. Se vende por cambio de domicilio. Animal sano, acostumbrado a convivir con personas. Originalidad y carácter garantizados.",
        seller_name: "Granja Cordoba Sur",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/70c92a2e-ab4b-421a-aeb1-2923814b1109?rule=hw396_70"
    },
    {
        title: "Cerdo Macho Euskal Txerria Puro - Semental",
        price: 400,
        location: "Lakuntza (Navarra)",
        description: "Vendo macho Euskal Txerria puro por cambio de sangre en la explotación. Raza autóctona vasca de gran valor genético. Ideal para semental o reproducción.",
        seller_name: "Txerri Baserria Navarra",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/692cb6a4-1806-468f-a454-23b2ddd94c1b?rule=hw396_70"
    },
    {
        title: "Cerdo Casero - Venta en Vivo o en Canal",
        price: 350,
        location: "Rebordanes (Pontevedra)",
        description: "Se vende cerdo de casa. Criado de manera tradicional. Se puede ver sin compromiso. Entero o medio. Vivo a 4€/kg y en canal a 5€/kg. Excelente calidad gallega.",
        seller_name: "Granxa Galega",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/c92ea60b-6e26-46c1-9ab2-913da88f4c2f?rule=hw396_70"
    },
    {
        title: "Cerdo Macho Sin Capar - 60 kg",
        price: 220,
        location: "Alcolea de Tajo (Toledo)",
        description: "Macho sin capar, mediano, con unos 60 kg de peso. Buen ejemplar criado con alimentación tradicional. Contactar por WhatsApp para coordinar visita.",
        seller_name: "Finca Extremadura",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/3d023c4d-90b6-45b9-a4a4-64d4cfeb1bda?rule=hw396_70"
    },
    {
        title: "Cerdo para Semental o Vida - Granada",
        price: 150,
        location: "Villanueva de Mesias (Granada)",
        description: "Venta de cerdo para semental o para vida. Muy dócil y buen ejemplar. Animal en perfectas condiciones sanitarias. Entrega en mano o con transporte concertado.",
        seller_name: "Granja Granada",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/424b6919-fd8e-4c37-acc2-36858f007e3b?rule=hw396_70"
    },
    {
        title: "Cerdos Yorkshire de 40 kg - Cantabria",
        price: 150,
        location: "Omoño (Cantabria)",
        description: "Cerdos Yorkshire de unos 40 kg, algunos con más peso. Muy buenos ejemplares de esta raza clásica. Solo atiendo llamadas telefónicas para mayor comodidad.",
        seller_name: "Ganadería Cantabria Sur",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/64eb67bd-9604-48ff-99a1-682f2aa18351?rule=hw396_70"
    },
    {
        title: "Cerdos Capados - 100 kg - Buena Raza",
        price: 500,
        location: "Suances (Cantabria)",
        description: "Se vende cerdo de buena raza, criado a capricho, capado, pesa sobre 100 kg. Disponibles dos ejemplares para elegir. Calidad excepcional para matanza.",
        seller_name: "Granja Suances",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/7059f26c-bc3d-4678-b396-0fe4f95e0cb3?rule=hw396_70"
    },
    {
        title: "Cerdos de Campo - Varios Pesos - Málaga",
        price: 180,
        location: "Coín (Málaga)",
        description: "Cerdos de varios pesos, criados en campo abierto con alimentación natural. Excelente sabor y calidad de la carne. Disponibles todo el año.",
        seller_name: "Finca Andaluza",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/2feb64a2-df50-498f-a045-6d9f5506baa6?rule=hw396_70"
    },
    {
        title: "Cerdos Capados - 60-70 kg - Baleares",
        price: 200,
        location: "Campos (Baleares)",
        description: "Vendo 2 cerdos capados de unos 60-70 kg aproximadamente. 200€ cada uno. Animales sanos, bien alimentados. Excelente calidad de la carne mallorquina.",
        seller_name: "Finca Mallorquina",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/e9fd5521-2f5a-4821-afe6-343692a74cda?rule=hw396_70"
    },
    {
        title: "Cerdos Vietnamitas - Madre, Padre y 4 Crías",
        price: 40,
        location: "Alegría-Dulantzi (Álava)",
        description: "Vendo seis cerdos vietnamitas: madre, padre y 4 crías de casi un mes. Precio por cabeza 40€, algo negociable. Raza miniatura muy popular por su carácter dócil.",
        seller_name: "Granja Álava",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/7da5f846-f753-49eb-83ca-337fe096978a?rule=hw396_70"
    },
    {
        title: "Cerdos a Destete - Varias Razas - A Coruña",
        price: 100,
        location: "As Pontes de Garcia Rodriguez (A Coruña)",
        description: "Venta de cerdos a destete, varias razas disponibles. Consulte disponibilidad y precios. Animales vacunados y desparasitados. Entrega en zona o con portes.",
        seller_name: "Ganadería As Pontes",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/817646c4-2e34-4483-9100-ec231d748693?rule=hw396_70"
    },
    {
        title: "Cerdos Criados en Casa - A Coruña",
        price: 130,
        location: "Padrón (A Coruña)",
        description: "Cerdos muy buenos criados en casa y de muy buena calidad. Alimentación tradicional gallega con productos naturales. Excelente para matanza familiar.",
        seller_name: "Casa Rural Galega",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/ee723bdf-e009-4509-85c1-bab3076385c5?rule=hw396_70"
    },
    {
        title: "Cerdos 170 kg - Criados en Casa - A Coruña",
        price: 280,
        location: "Chousela (A Coruña)",
        description: "Se venden 2 cerdos sobre 170 kilos vivos, criados en casa y de muy buena calidad. Alimentación natural. Listos para matanza. Entre 4-5€/kg según trato.",
        seller_name: "Explotación Familiar Coruña",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/600a88c3-e13a-4e6f-9f61-c0a1ca51ad3e?rule=hw396_70"
    },
    {
        title: "Cerdos de 7 Meses - 100/110 kg Canal - Lugo",
        price: 250,
        location: "Outeiro de Rei (Lugo)",
        description: "Se venden cerdos de siete meses de edad, peso aproximado 100/110 kg canal. Se venden juntos o por separado. Excelente calidad para matanza o vida.",
        seller_name: "Ganadería Lugo Central",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/4aeb3bbd-0a4a-469c-ab1a-1d1089cfc379?rule=hw396_70"
    },
    {
        title: "Cerditos al Destete - Raza Duroc - Asturias",
        price: 90,
        location: "Carreño (Asturias)",
        description: "Se venden cerditos al destete, raza Duroc. Reservar antes de que se agoten. Raza de alta calidad cárnica, reconocida por su excelente sabor y veteado de la carne.",
        seller_name: "Granja Asturiana",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/089152c3-d71a-4bbd-b4d3-1d8f003210ab?rule=hw396_70"
    },
    {
        title: "Cerdos Celtas - Criados en Exterior - Lugo",
        price: 180,
        location: "Palas de Rei (Lugo)",
        description: "Cerdos celtas criados exclusivamente en exterior y respetan pastor eléctrico. Raza autóctona gallega de excelente calidad. Próximas camadas disponibles. Consultar.",
        seller_name: "Granja Celta Lugo",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/c27734e6-d1cf-4ba2-9089-43debe5435fb?rule=hw396_70"
    },
    {
        title: "Cerdo Ibérico de Pura Raza - Criado en Montanera",
        price: 600,
        location: "Zamora (Zamora)",
        description: "Cerdo ibérico de pura raza, criado en montanera con bellotas. Excelente calidad de la carne con infiltración de grasa natural. El mejor cerdo ibérico de la dehesa zamorana.",
        seller_name: "Dehesa Zamorana",
        image_url: "https://images.milanuncios.com/api/v1/ma-ad-media-pro/images/59bbc985-cd40-4db6-821f-5623c89ff527?rule=hw396_70"
    }
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
await mkdir('/tmp/ruralpop_cerdos', { recursive: true });

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
    // ✅ Subimos al bucket 'listings' ya existente
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
    console.log(`🐷 Insertando ${LISTINGS.length} anuncios de cerdos (animales/Porcino)...\n`);
    let inserted = 0, failed = 0;

    for (const [idx, item] of LISTINGS.entries()) {
        console.log(`\n[${idx + 1}/${LISTINGS.length}] "${item.title}"`);

        const localPath = `/tmp/ruralpop_cerdos/cerdo_${idx}.jpg`;
        // ✅ Ruta dentro del bucket 'listings' - subcarpeta scraped/
        const storagePath = `scraped/cerdos_${Date.now()}_${idx}.jpg`;
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
            subcategory: 'Porcino',     // ✅ Subcategoría correcta
            user_id: userId,
            status: 'active',
        });

        if (error) {
            console.error(`  ❌ Error al insertar: ${error.message}`);
            failed++;
        } else {
            console.log(`  ✅ Insertado! (animales / Porcino)`);
            inserted++;
        }

        await new Promise(r => setTimeout(r, 300));
    }

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`🎉 Proceso completado: ${inserted} insertados, ${failed} fallidos.`);
    console.log(`📦 Todas las imágenes en el bucket 'listings/scraped/'`);
}

main().catch(console.error);
