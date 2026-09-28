const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const EQUIPOP_TENANT_ID = '69d55371-2f70-4e67-b55c-4502bce305bb';
const GHOST_USER_ID = '5902a215-7d21-4068-9971-4effd6a0448c';

const NEW_PRODUCTS = [
    {
        keyPrefix: 'kentucky_sheepskin_halter',
        title: 'Cabezada de Cuadra Kentucky Horsewear Sheepskin Natural',
        title_pt: 'Cabeçada de Estábulo Kentucky Horsewear Sheepskin Natural',
        price: 99.99,
        price_type: 'fixed',
        shipping_price: 5.90,
        vender_online: true,
        is_featured: false,
        created_at: '2020-01-01T12:00:21.000Z',
        category: 'establo-y-cuadra',
        subcategory: 'Cabezadas de cuadra',
        tags: ['cabezada de cuadra', 'kentucky horsewear', 'sheepskin', 'transporte', 'borreguillo natural'],
        imageSourceUrls: [
            'https://cdn.shopify.com/s/files/1/0909/2251/6829/files/306766_NAT_1.jpg?v=1758611941'
        ],
        description: `Cabezada de cuadra y transporte Kentucky Horsewear Sheepskin en color natural. Confeccionada especialmente para ofrecer la máxima comodidad y protección durante viajes y estancia en cuadra.

Características principales:
- Estructura base de nylon ultra resistente combinada con suave piel de oveja artificial (sheepskin) desarrollada por Kentucky.
- Extremadamente ligera, reduciendo significativamente la presión en la nuca y testera del caballo.
- Previene rozaduras, pérdidas de pelo y marcas en las zonas más sensibles de la cabeza.
- Hebillas y mosquetón de apertura rápida dorados de alta durabilidad y elegancia.
- Fácil mantenimiento y lavable a máquina a 30°C.`,
        description_pt: `Cabeçada de estábulo e transporte Kentucky Horsewear Sheepskin em cor natural. Confeccionada especialmente para máximo conforto e proteção durante viagens e cocheira.

Principais características:
- Estrutura base de nylon ultra resistente combinada com pele de ovelha sintética macia de alta tecnologia.
- Extremamente leve, reduzindo a pressão na nuca e áreas sensíveis da cabeça do cavalo.
- Previne assaduras e atritos durante transportes prolongados.
- Fivelas e mosquetão dourados resistentes e refinados.
- Lavável na máquina a 30°C.`
    },
    {
        keyPrefix: 'bense_eicke_schmutzliese',
        title: 'Cepillo de Fibra 100% Natural Bense & Eicke Schmutzliese',
        title_pt: 'Escova de Fibra 100% Natural Bense & Eicke Schmutzliese',
        price: 17.77,
        price_type: 'fixed',
        shipping_price: 3.90,
        vender_online: true,
        is_featured: false,
        created_at: '2020-01-01T12:00:20.000Z',
        category: 'cuidado-e-higiene-del-caballo',
        subcategory: 'Cepillos y kits de limpieza',
        tags: ['cepillo caballo', 'bense eicke', 'schmutzliese', 'fibras naturales', 'higiene equina'],
        imageSourceUrls: [
            'https://www.tiendacaballos.com/wp-content/uploads/2023/05/cepillo-de-fibra-100-natural-be-schmutzliese.jpg',
            'https://www.tiendacaballos.com/wp-content/uploads/2023/05/cepillo-de-fibra-100-natural-be-schmutzliese-1.jpg'
        ],
        description: `Cepillo Schmutzliese de Bense & Eicke fabricado con fibras 100% naturales. Diseñado para una limpieza en profundidad tanto del cuerpo como de las extremidades del caballo.

Características principales:
- Fibras 100% naturales combinadas: núcleo interior de fibras duras para desincrustar el barro y suciedad gruesa, rodeado de fibras exteriores suaves para retirar el polvo fino y abrillantar.
- Cerdas largas de 65 mm para una acción de cepillado dinámica y eficaz sin esfuerzo.
- Bloque anatómico ergonómico elaborado en madera de haya alemana lacada al agua con sello ecológico orgánico (200 x 59 mm).
- Cero carga electrostática gracias al empleo exclusivo de componentes puros naturales.
- Fabricado artesanalmente en Alemania siguiendo la más estricta tradición ecuestre.`,
        description_pt: `Escova Schmutzliese da Bense & Eicke confeccionada com fibras 100% naturais para limpeza profunda do corpo e membros do cavalo.

Principais características:
- Fibras 100% naturais: interior com cerdas firmes para barro grosso e exterior macio para pó fino e brilho.
- Cerdas longas de 65 mm com ação dinâmica e sem esforço.
- Base anatômica ergonômica em madeira de faia alemã com acabamento ecológico (200 x 59 mm).
- Sem eletricidade estática por ser totalmente natural.
- Fabricação artesanal tradicional na Alemanha.`
    },
    {
        keyPrefix: 'casco_las_opera',
        title: 'Casco de Equitación LAS Opera',
        title_pt: 'Capacete de Equitação LAS Opera',
        price: 374.33,
        price_type: 'fixed',
        shipping_price: 8.50,
        vender_online: true,
        is_featured: false,
        created_at: '2020-01-01T12:00:19.000Z',
        category: 'cascos-y-seguridad',
        subcategory: 'Cascos',
        tags: ['casco equitacion', 'las opera', 'seguridad', 'doma clasica', 'salto'],
        imageSourceUrls: [
            'https://www.tiendacaballos.com/wp-content/uploads/2025/04/casco-las-opera.jpg',
            'https://www.tiendacaballos.com/wp-content/uploads/2025/04/casco-las-opera-1.jpg',
            'https://www.tiendacaballos.com/wp-content/uploads/2025/04/casco-las-opera-2.jpg',
            'https://www.tiendacaballos.com/wp-content/uploads/2025/04/casco-las-opera-3.jpg',
            'https://www.tiendacaballos.com/wp-content/uploads/2025/04/casco-las-opera-4.jpg'
        ],
        description: `Casco de equitación de alta gama LAS Opera. Elegancia italiana contemporánea y máxima tecnología de seguridad para doma clásica y salto.

Características principales:
- Seguridad avanzada: carcasa exterior en ABS y policarbonato de alta resistencia con tecnología In/Out Moulding y poliestireno de densidad variable para absorción progresiva de impactos.
- Sistema de ventilación 10 orificios: canales frontales de entrada de aire fresco y extractores traseros que aseguran un flujo continuo impidiendo la acumulación de sudor.
- Forro interior viscoelástico: confeccionado en tejido técnico Soft Hydrophilic con protector de nuca integrado, desmontable y lavable a máquina.
- Barboquejo ajustable en piel sintética hipoalergénica con cierre de precisión.
- Certificaciones oficiales de seguridad: CE EN 1384:2023, VG1 01.040 y ASTM F1163-23.`,
        description_pt: `Capacete de equitação de alta gama LAS Opera. Elegância italiana contemporânea e tecnologia superior de segurança para adestramento e salto.

Principais características:
- Segurança avançada: estrutura externa em ABS e policarbonato de alta resistência com tecnologia In/Out Moulding e absorção progressiva de impacto.
- Ventilação com 10 orifícios para fluxo constante de ar e controle térmico.
- Forro interno viscoelástico em tecido técnico Soft Hydrophilic removível e lavável.
- Jugular ajustável em couro sintético hipoalergênico.
- Certificações oficiais de segurança: CE EN 1384:2023, VG1 01.040 e ASTM F1163-23.`
    },
    {
        keyPrefix: 'casco_tattini_nettuno',
        title: 'Casco Hípico Tattini Nettuno',
        title_pt: 'Capacete Hípico Tattini Nettuno',
        price: 231.61,
        price_type: 'fixed',
        shipping_price: 7.50,
        vender_online: true,
        is_featured: false,
        created_at: '2020-01-01T12:00:18.000Z',
        category: 'cascos-y-seguridad',
        subcategory: 'Cascos',
        tags: ['casco equitacion', 'tattini nettuno', 'oro rosa', 'cristales', 'seguridad ecuestre'],
        imageSourceUrls: [
            'https://www.tiendacaballos.com/wp-content/uploads/2024/10/casco-hipico-tattini-nettuno.jpg',
            'https://www.tiendacaballos.com/wp-content/uploads/2024/10/casco-hipico-tattini-nettuno-1.jpg',
            'https://www.tiendacaballos.com/wp-content/uploads/2024/10/casco-hipico-tattini-nettuno-2.jpg',
            'https://www.tiendacaballos.com/wp-content/uploads/2024/10/casco-hipico-tattini-nettuno-3.jpg',
            'https://www.tiendacaballos.com/wp-content/uploads/2024/10/casco-hipico-tattini-nettuno-4.jpg'
        ],
        description: `Casco hípico Tattini modelo Nettuno con acabados de auténtico lujo. Diseñado para jinetes y amazonas que buscan una estética impecable sin renunciar a la más exigente homologación europea.

Características principales:
- Decoración refinada con incrustaciones de cristales brillantes y perfiles pulidos en tono oro rosa.
- Visera amplia envolvente que protege eficazmente contra el sol y la lluvia mejorando el campo visual.
- Dobles rejillas de ventilación laterales para una óptima circulación del aire durante el ejercicio.
- Sistema de ajuste micrométrico mediante ruedecilla trasera para una sujeción milimétrica anatómica.
- Acolchado interior transpirable, completamente desmontable y lavable.
- Homologación oficial CE EN1384:2023 y certificación de calidad TÜV.`,
        description_pt: `Capacete hípico Tattini modelo Nettuno com acabamento luxuoso em ouro rosa e cristais brilhantes.

Principais características:
- Detalhes refinados com inserções de cristais e perfis polidos em tom ouro rosa.
- Aba larga envolvente para proteção contra sol e intempéries.
- Grelhas duplas de ventilação lateral para ótima circulação de ar.
- Ajuste micrométrico por disco giratório traseiro para encaixe seguro.
- Forro interno respirável, removível e lavável.
- Homologação oficial CE EN1384:2023 e certificação TÜV.`
    }
];

async function deploy() {
    console.log("=== INICIANDO SUBIDA DE PRODUCTOS (CABEZADA, CEPILLO Y CASCOS) PARA CORNER PRO ===");

    // 1. Eliminar productos genéricos antiguos reemplazados
    console.log("1. Eliminando productos genéricos antiguos sustituidos...");
    const oldGenericIds = [
        'd12db61f-f80f-4499-8993-a6568522ad68', // Cabezada genérica Wikipedia
        'fe7bbdc7-3bf8-4b5f-a2ad-7e819e6f6fa9', // Cepillo de raíces genérico Wikipedia
        '996a1369-5ad0-4c7e-8cfa-2edf58ce95d7', // Casco VG1 genérico Wikipedia
        '653111e8-cddb-4109-81b2-2d8d975a40cd'  // Casco terciopelo genérico Wikipedia
    ];

    const { error: delErr } = await supabase
        .from('listings')
        .delete()
        .in('id', oldGenericIds);

    if (delErr) {
        console.warn("Aviso al eliminar productos genéricos antiguos:", delErr);
    } else {
        console.log("✓ Productos genéricos antiguos eliminados correctamente");
    }

    // 2. Descargar y subir imágenes a Supabase Storage
    const itemsToInsert = [];

    for (const prod of NEW_PRODUCTS) {
        console.log(`\nProcesando producto: ${prod.title}...`);
        const uploadedUrls = [];

        for (let idx = 0; idx < prod.imageSourceUrls.length; idx++) {
            const srcUrl = prod.imageSourceUrls[idx];
            console.log(`  - Descargando imagen ${idx + 1}/${prod.imageSourceUrls.length}: ${srcUrl}`);
            try {
                const res = await fetch(srcUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
                });

                if (!res.ok) {
                    console.error(`    Error al descargar: HTTP ${res.status}`);
                    continue;
                }

                const buffer = Buffer.from(await res.arrayBuffer());
                const filePath = `corner-pro/${prod.category}/${prod.keyPrefix}_${idx + 1}.jpg`;

                const { error: upErr } = await supabase.storage
                    .from('wpublic')
                    .upload(filePath, buffer, {
                        contentType: 'image/jpeg',
                        upsert: true
                    });

                if (upErr) {
                    console.error("    Error al subir imagen:", upErr);
                    uploadedUrls.push(srcUrl);
                } else {
                    const publicUrl = supabase.storage.from('wpublic').getPublicUrl(filePath).data.publicUrl;
                    console.log(`    -> Subida OK: ${publicUrl}`);
                    uploadedUrls.push(publicUrl);
                }
            } catch (err) {
                console.error("    Excepción al procesar imagen:", err.message);
                uploadedUrls.push(srcUrl);
            }
        }

        itemsToInsert.push({
            title: prod.title,
            title_pt: prod.title_pt,
            description: prod.description,
            description_pt: prod.description_pt,
            price: prod.price,
            price_type: prod.price_type,
            shipping_price: prod.shipping_price,
            vender_online: prod.vender_online,
            is_featured: prod.is_featured,
            created_at: prod.created_at,
            category: prod.category,
            subcategory: prod.subcategory,
            equipop_category: prod.category,
            equipop_subcategory: prod.subcategory,
            tags: prod.tags,
            image_urls: uploadedUrls,
            user_id: GHOST_USER_ID,
            tenant_id: EQUIPOP_TENANT_ID,
            location: 'Madrid (Madrid)',
            province_id: 28,
            municipality_id: 28127,
            contact_phone: '+34 918 420 891',
            status: 'active',
            shared_to_equipop: false
        });
    }

    // 3. Insertar productos en Supabase public.listings
    console.log("\n3. Insertando productos en public.listings...");
    const { data: inserted, error: insErr } = await supabase
        .from('listings')
        .insert(itemsToInsert)
        .select('id, title, category, subcategory, price, created_at, image_urls');

    if (insErr) {
        console.error("Error al insertar productos:", insErr);
        process.exit(1);
    }

    console.log(`\n¡Éxito! ${inserted.length} productos insertados para Corner Pro:`);
    inserted.forEach(item => {
        console.log(`- [${item.id}] ${item.title}`);
        console.log(`  Categoría: ${item.category} | Subcategoría: ${item.subcategory} | Precio: ${item.price} €`);
        console.log(`  Fotos: ${item.image_urls.length} subidas | created_at: ${item.created_at}`);
    });

    console.log("\n=== OPERACIÓN COMPLETADA CON ÉXITO ===");
}

deploy();
