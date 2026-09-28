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
        keyPrefix: 'wild_river_boots',
        title: 'Botas de Montar Altas Wild River Cuero Marrón Oscuro',
        title_pt: 'Botas de Montaria Altas Wild River Couro Castanho Escuro',
        price: 231.03,
        price_type: 'fixed',
        shipping_price: 8.50,
        vender_online: true,
        is_featured: false,
        created_at: '2020-01-01T12:00:25.000Z',
        category: 'calzado-ecuestre',
        subcategory: 'Botas de montar',
        tags: ['botas de montar', 'wild river', 'cuero marron', 'bota alta', 'equitacion', 'impermeable'],
        imageSourceUrls: [
            'https://cdn.shopify.com/s/files/1/0909/2251/6829/files/CS8CT_780_01_27a26ba5-b950-4887-ae44-36943cc384eb.jpg?v=1758602911'
        ],
        description: `Botas altas de equitación modelo Wild River confeccionadas en cuero plena flor de primera calidad en color marrón oscuro (Dark Brown).

Características principales:
- Piel de plena flor seleccionada, resistente y flexible con un acabado elegante y natural.
- Pie resistente al agua para mantener los pies secos y confortables en cualquier condición meteorológica.
- Refuerzo anatómico integrado en la caña que mejora la sujeción y estabilidad sobre el estribo.
- Zona elástica oculta paralela a la cremallera para un ajuste ergonómico perfecto a la pantorrilla.
- Entresuela de amortiguación en PU que absorbe eficazmente los impactos durante la monta y la marcha en la cuadra.`,
        description_pt: `Botas de montaria altas modelo Wild River confeccionadas em couro legítimo de alta qualidade em castanho escuro (Dark Brown).

Principais características:
- Couro de grão integral selecionado, resistente, flexível e elegante.
- Parte do pé resistente à água para manter os pés secos em qualquer clima.
- Reforço anatômico na cana para maior estabilidade no estribo.
- Painel elástico oculto para ajuste anatômico sob medida na panturrilha.
- Entressola em PU amortecedora de impactos para conforto prolongado.`
    },
    {
        keyPrefix: 'rover_dressage_boots',
        title: 'Botas de Doma Clásica Altas Rover Negro',
        title_pt: 'Botas de Adestramento Altas Rover Preto',
        price: 64.99,
        price_type: 'fixed',
        shipping_price: 6.90,
        vender_online: true,
        is_featured: false,
        created_at: '2020-01-01T12:00:24.000Z',
        category: 'calzado-ecuestre',
        subcategory: 'Botas de montar',
        tags: ['botas de montar', 'rover', 'botas de doma', 'bota alta', 'negro', 'calzado jinete'],
        imageSourceUrls: [
            'https://cdn.shopify.com/s/files/1/0909/2251/6829/files/39093_bl_01.jpg?v=1758594717'
        ],
        description: `Botas altas de montar y doma clásica modelo Rover en color negro. Combinan estética tradicional, facilidad de uso diario y excelente confort.

Características principales:
- Confeccionadas en cuero sintético técnico de tacto suave, duradero y de fácil mantenimiento.
- Forro interior de malla transpirable que evita la condensación y mantiene una ventilación adecuada.
- Cremallera trasera completa YKK para calzarse y descalzarse con rapidez.
- Cierre superior e inferior de botón a presión con solapa de protección para asegurar un cierre ceñido.
- Suela de goma antideslizante con dibujo estriado para máxima adherencia en el estribo.
- Diseño elegante y atemporal adecuado tanto para entrenamiento diario como para concurso.`,
        description_pt: `Botas altas de montaria e adestramento clássico modelo Rover em preto. Estilo refinado com conforto para uso diário e pistas.

Principais características:
- Couro sintético técnico de toque macio, resistente e fácil de limpar.
- Forro interno em malha respirável que previne condensação.
- Zíper traseiro YKK completo para calce rápido e seguro.
- Fechos com botão de pressão e proteção superior e inferior.
- Sola antiderrapante estriada para aderência firme no estribo.
- Design atemporal ideal para treino e apresentações.`
    },
    {
        keyPrefix: 'filete_beris_articulado',
        title: 'Filete de Anillas Beris Articulación Simple (Anilla 6 cm)',
        title_pt: 'Filete de Argolas Beris Articulação Simples (Argola 6 cm)',
        price: 79.95,
        price_type: 'fixed',
        shipping_price: 4.90,
        vender_online: true,
        is_featured: false,
        created_at: '2020-01-01T12:00:23.000Z',
        category: 'bocados-y-filetes',
        subcategory: 'Filetes',
        tags: ['filete', 'beris', 'articulacion simple', 'anillas 6cm', 'embocadura', 'bocados'],
        imageSourceUrls: [
            'https://www.tiendahipicaonline.es/162634-thickbox_default/filetes-de-anillas-beris-articulacion-simple-anilla-de-6-cm.jpg'
        ],
        description: `Filete de anillas Beris con embocadura de articulación simple y anillas de 6 cm de diámetro. Diseñado por la prestigiosa manufactura alemana Beris para proteger la boca del caballo.

Características principales:
- Embocadura con perfil especial aplanado y grosor de 15 mm que libera espacio en la boca del caballo, optimizando el confort del paladar y la lengua.
- Compuesto sintético especial Beris de grado alimentario: material ultra suave que se desliza con suavidad incluso en caballos con poca salivación, favoreciendo la masticación y la relajación.
- Anillas de 6 cm en acero inoxidable pulido a espejo de forma artesanal.
- Contacto suave, directo y armónico entre la mano del jinete y la boca del caballo.
- Auténtica manufactura artesanal Made in Germany.`,
        description_pt: `Filete de argolas Beris com articulação simples e argolas de 6 cm. Desenvolvido artesanalmente na Alemanha para máxima proteção da boca do cavalo.

Principais características:
- Espessura de 15 mm com desenho aplanado que alivia o palato e a língua.
- Composto sintético alimentar Beris ultra suave que desliza perfeitamente e estimula a mastigação.
- Argolas em aço inoxidável polido à mão.
- Comunicação suave, precisa e confiável com a mão do cavaleiro.
- Fabricação artesanal Made in Germany.`
    },
    {
        keyPrefix: 'filete_oliva_pure',
        title: 'Filete de Oliva Beris PURE Extra Suave (Anilla 7,5 cm)',
        title_pt: 'Filete de Oliva Beris PURE Extra Suave (Argola 7,5 cm)',
        price: 89.95,
        price_type: 'fixed',
        shipping_price: 4.90,
        vender_online: true,
        is_featured: false,
        created_at: '2020-01-01T12:00:22.000Z',
        category: 'bocados-y-filetes',
        subcategory: 'Filetes',
        tags: ['filete de oliva', 'beris pure', 'extra suave', 'anillas 7.5cm', 'embocadura', 'caballos jovenes'],
        imageSourceUrls: [
            'https://www.tiendahipicaonline.es/162575-thickbox_default/filete-oliva-pure-anilla-de-75-cm-extra-suave.jpg'
        ],
        description: `Filete de oliva Beris PURE con embocadura extra suave y anillas de oliva de 7,5 cm. Diseñado para una comunicación óptima y sin tensiones.

Características principales:
- Embocadura anatómica recta de flexibilidad extrema que reparte homogéneamente la presión sobre la lengua y las barras.
- Anillas de oliva de 7,5 cm que evitan pellizcos en las comisuras y proporcionan una sujeción y guía lateral excelente en los giros.
- Especialmente indicado para caballos jóvenes, potros o caballos con bocas especialmente sensibles o reactivas.
- Material Beris PRIME de grado alimentario de máxima biocompatibilidad y textura suave que estimula la salivación.
- Piezas laterales en acero inoxidable macizo con peso equilibrado para una posición neutra y tranquila en la boca.
- Grosor de la embocadura: 18 mm. Fabricación artesanal alemana.`,
        description_pt: `Filete de oliva Beris PURE com bocal reto extra suave e argolas de oliva de 7,5 cm.

Principais características:
- Formato anatômico reto flexível que distribui uniformemente a pressão na língua e barras.
- Argolas de oliva de 7,5 cm que não beliscam as comissuras e proporcionam sustentação lateral nas curvas.
- Perfeito para cavalos jovens, poldros e bocas sensíveis.
- Material Beris PRIME de grau alimentar suave e biocompatível.
- Laterais equilibradas em aço inox para posição neutra e estável.
- Espessura de 18 mm. Fabricado na Alemanha.`
    }
];

async function deploy() {
    console.log("=== INICIANDO SUBIDA DE BOTAS DE MONTAR Y FILETES PARA CORNER PRO ===");

    // 1. Dar de alta subcategoría 'Botas de montar' si no existe
    console.log("1. Comprobando subcategoría 'Botas de montar' en calzado-ecuestre...");
    const { data: existingSub } = await supabase
        .from('subcategories')
        .select('id, name')
        .eq('category_id', 'calzado-ecuestre')
        .eq('name', 'Botas de montar')
        .single();

    if (!existingSub) {
        const { error: subErr } = await supabase
            .from('subcategories')
            .insert({
                category_id: 'calzado-ecuestre',
                name: 'Botas de montar',
                name_pt: 'Botas de montaria',
                tenant_id: EQUIPOP_TENANT_ID,
                order_index: 10
            });
        if (subErr) {
            console.error("Error al insertar subcategoría:", subErr);
        } else {
            console.log("✓ Subcategoría 'Botas de montar' creada con éxito");
        }
    } else {
        console.log("✓ Subcategoría 'Botas de montar' ya existía");
    }

    // 2. Eliminar las botas genéricas anteriores y el filete genérico
    console.log("\n2. Eliminando productos genéricos antiguos sustituidos...");
    const oldGenericIds = [
        'cdb2159e-7058-49ac-8f80-a74031cbb21a', // Botas de Doma genéricas Wikipedia
        'bc33bd97-12bd-4b0f-b84b-cf5af4af3331', // Botines Jodhpur genéricos Wikipedia
        'e9fe1418-a21e-4160-aba7-767c66058635'  // Filetes genéricos Wikipedia
    ];

    const { error: delErr } = await supabase
        .from('listings')
        .delete()
        .in('id', oldGenericIds);

    if (delErr) {
        console.warn("Aviso al eliminar productos genéricos:", delErr);
    } else {
        console.log("✓ Productos genéricos antiguos eliminados correctamente");
    }

    // 3. Descargar fotos y subir a Supabase Storage
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

    // 4. Insertar productos en Supabase public.listings
    console.log("\n4. Insertando productos en public.listings...");
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
