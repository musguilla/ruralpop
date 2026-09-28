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
        keyPrefix: 'lemieux_loire_gooseberry',
        title: 'Mantilla LeMieux Loire Classic Close Contact Gooseberry',
        title_pt: 'Mantilha LeMieux Loire Classic Close Contact Gooseberry',
        price: 99.95,
        price_type: 'fixed',
        shipping_price: 5.90,
        vender_online: true,
        is_featured: false,
        created_at: '2020-01-01T12:00:17.000Z',
        category: 'mantillas-y-salvacruces',
        subcategory: 'Sillines de salto',
        tags: ['mantilla', 'lemieux', 'loire classic', 'sillin de salto', 'close contact', 'gooseberry'],
        imageSourceUrl: 'https://cdn.shopify.com/s/files/1/0909/2251/6829/files/1WB19_653_01.jpg?v=1787172797',
        description: `Mantilla de salto LeMieux Loire Classic Close Contact cuadrada en color Gooseberry. Reconocida como una de las mantillas más elegantes de LeMieux, combinando máxima sofisticación, estilo y tecnología avanzada para la disciplina de salto.

Características principales:
- Parte superior en satén tejido Loire de tacto sedoso y brillo refinado.
- Forro interior de mezcla de bambú 100% natural, sumamente suave, transpirable y termorregulador que absorbe la humedad eficazmente.
- Diseño anatómico con corte alto en la cruz que alivia la presión sobre el dorso y optimiza el ajuste bajo la silla de salto.
- Ribete exterior suave y flexible libre de fricción para evitar cualquier tipo de rozadura en el caballo.
- Protección reforzada en la zona de la cincha con cuero sintético texturizado, logotipo LeMieux grabado y trabillas interiores de sujeción.`,
        description_pt: `Mantilha de salto LeMieux Loire Classic Close Contact quadrada na cor Gooseberry. Reconhecida como uma das mantilhas mais elegantes da LeMieux, combinando sofisticação, estilo e tecnologia avançada para a disciplina de salto.

Principais características:
- Parte superior em cetim entrelaçado Loire com toque sedoso e brilho refinado.
- Forro interno em mescla de bambu 100% natural, macio, respirável e termorregulador.
- Corte anatômico de cernelha alta que alivia a pressão no dorso do cavalo.
- Debrum macio e sem atrito para evitar qualquer tipo de assadura.
- Reforço na área da cilha em couro sintético texturizado com logo LeMieux.`
    },
    {
        keyPrefix: 'kentucky_glitter_navy',
        title: 'Mantilla de Salto Kentucky Horseware Glitter Band Navy',
        title_pt: 'Mantilha de Salto Kentucky Horseware Glitter Band Navy',
        price: 74.99,
        price_type: 'fixed',
        shipping_price: 5.90,
        vender_online: true,
        is_featured: false,
        created_at: '2020-01-01T12:00:16.000Z',
        category: 'mantillas-y-salvacruces',
        subcategory: 'Sillines de salto',
        tags: ['mantilla', 'kentucky horseware', 'glitter band', 'sillin de salto', 'salto obstaculos', 'navy'],
        imageSourceUrl: 'https://cdn.shopify.com/s/files/1/0909/2251/6829/files/8RKX5_580_01.jpg?v=1770782737',
        description: `Mantilla de salto Kentucky Horseware modelo Glitter Band en color Navy (azul marino). Diseño exclusivo con elegante ribete glitter que aporta distinción en pista y concurso, manteniendo los más altos estándares de comodidad anatómica.

Características principales:
- Confeccionada en mezcla técnica de algodón y poliéster con patrón acolchado de panal de abeja de secado ultra rápido.
- Acolchado interior transpirable que proporciona una excelente amortiguación y absorción de impactos entre la montura y el lomo del caballo.
- Corte ergonómico adaptado a la morfología de la cruz para evitar deslizamientos, presiones o rozaduras.
- Logotipo distintivo de Kentucky Horseware bordado sobre parche de cuero vegano premium.
- Adecuada tanto para entrenamientos diarios exigentes como para competición de salto.`,
        description_pt: `Mantilha de salto Kentucky Horseware modelo Glitter Band em azul marinho (Navy). Design exclusivo com debrum brilhante glitter que confere distinção na pista e nas competições.

Principais características:
- Tecido em mescla técnica de algodão e poliéster com acolchoamento em padrão favo de mel de secagem rápida.
- Acolchoamento respirável com amortecimento eficaz de impactos entre a sela e o dorso do cavalo.
- Corte ergonômico anatômico que protege a cernelha contra fricção e deslizamentos.
- Distintivo clássico Kentucky em couro vegano premium.
- Ideal para treinos diários e concursos de salto.`
    },
    {
        keyPrefix: 'prime_air_tec_sky_blue',
        title: 'Mantilla de Salto Weatherbeeta Prime Air-Tec Sky Blue',
        title_pt: 'Mantilha de Salto Weatherbeeta Prime Air-Tec Sky Blue',
        price: 49.45,
        price_type: 'fixed',
        shipping_price: 5.90,
        vender_online: true,
        is_featured: false,
        created_at: '2020-01-01T12:00:15.000Z',
        category: 'mantillas-y-salvacruces',
        subcategory: 'Sillines de salto',
        tags: ['mantilla', 'weatherbeeta', 'air-tec', 'sillin de salto', 'sky blue', 'transpirable'],
        imageSourceUrl: 'https://cdn.shopify.com/s/files/1/0909/2251/6829/files/EYXJ3_515_01.jpg?v=1758601200',
        description: `Mantilla técnica de salto Weatherbeeta Prime Air-Tec en color Sky Blue (azul celeste). Desarrollada para ofrecer el máximo confort térmico y protección anatómica durante el entrenamiento y recorridos de salto de obstáculos.

Características principales:
- Tejido superior en 100% algodón pre-encogido de alta densidad, resistente y transpirable con acabado anti-fricción.
- Columna vertebral central de malla Air-Tec que proporciona una ventilación y disipación de calor sobresalientes.
- Forro técnico wick-easy que absorbe de inmediato el sudor manteniendo el lomo seco y fresco.
- Diseño anatómico con cruz elevada que garantiza espacio suficiente evitando roces en la columna.
- Parche de refuerzo en la zona de la cincha de 1680 deniers altamente resistente a la abrasión con correas elásticas con anilla en D.`,
        description_pt: `Mantilha técnica de salto Weatherbeeta Prime Air-Tec em azul celeste (Sky Blue). Desenvolvida para máximo conforto térmico e proteção anatômica durante o treino e salto de obstáculos.

Principais características:
- Tecido superior em 100% algodão pré-encolhido de alta densidade, resistente e respirável.
- Coluna central em malha Air-Tec que garante ventilação e dispersão superior de calor.
- Forro técnico wick-easy que absorve rapidamente a umidade mantendo o dorso seco.
- Corte anatômico de cernelha alta que previne atritos.
- Reforço na área da cilha em tecido 1680 deniers de alta durabilidade com fitas de fixação.`
    }
];

async function run() {
    console.log("=== INICIANDO CONFIGURACIÓN DE MANTILLAS / SILLINES DE SALTO PARA CORNER PRO ===");

    // 1. Actualizar categoría en DB a 'Mantillas'
    console.log("1. Actualizando nombre de categoría mantillas-y-salvacruces a 'Mantillas'...");
    const { error: catErr } = await supabase
        .from('categories')
        .update({ name: 'Mantillas' })
        .eq('id', 'mantillas-y-salvacruces');

    if (catErr) {
        console.error("Error actualizando categoría:", catErr);
    } else {
        console.log("✓ Categoría actualizada a 'Mantillas'");
    }

    // 2. Comprobar / insertar subcategoría 'Sillines de salto'
    console.log("2. Comprobando subcategoría 'Sillines de salto'...");
    const { data: existingSub } = await supabase
        .from('subcategories')
        .select('id, name')
        .eq('category_id', 'mantillas-y-salvacruces')
        .eq('name', 'Sillines de salto')
        .single();

    if (!existingSub) {
        const { error: subErr } = await supabase
            .from('subcategories')
            .insert({
                category_id: 'mantillas-y-salvacruces',
                name: 'Sillines de salto',
                name_pt: 'Selins de salto',
                tenant_id: EQUIPOP_TENANT_ID,
                order_index: 25
            });

        if (subErr) {
            console.error("Error insertando subcategoría:", subErr);
        } else {
            console.log("✓ Subcategoría 'Sillines de salto' creada");
        }
    } else {
        console.log("✓ Subcategoría 'Sillines de salto' ya existía");
    }

    // 3. Eliminar el producto antiguo de 'Mantas' de Corner Pro
    console.log("3. Eliminando producto antiguo de Mantas en Corner Pro...");
    const { error: delErr } = await supabase
        .from('listings')
        .delete()
        .eq('id', '44876320-7236-4457-9222-28dc34ef1b4d');

    if (delErr) {
        console.warn("Aviso al eliminar producto antiguo:", delErr);
    } else {
        console.log("✓ Producto antiguo de Mantas eliminado con éxito");
    }

    // 4. Descargar y subir fotos a Supabase Storage
    console.log("4. Descargando fotos y subiendo a Storage...");
    const itemsToInsert = [];

    for (const prod of NEW_PRODUCTS) {
        console.log(`- Descargando imagen para ${prod.title}...`);
        const res = await fetch(prod.imageSourceUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
        });

        if (!res.ok) {
            console.error(`  Error descargando foto: HTTP ${res.status}`);
            continue;
        }

        const buffer = Buffer.from(await res.arrayBuffer());
        const filePath = `corner-pro/saddle-pads/${prod.keyPrefix}.jpg`;

        const { error: upErr } = await supabase.storage
            .from('wpublic')
            .upload(filePath, buffer, {
                contentType: 'image/jpeg',
                upsert: true
            });

        let publicUrl;
        if (upErr) {
            console.error("  Error subiendo imagen:", upErr);
            publicUrl = prod.imageSourceUrl;
        } else {
            publicUrl = supabase.storage.from('wpublic').getPublicUrl(filePath).data.publicUrl;
            console.log(`  -> Subida OK: ${publicUrl}`);
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
            image_urls: [publicUrl],
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

    // 5. Insertar los 3 productos en listings
    console.log("5. Insertando productos en public.listings...");
    const { data: inserted, error: insErr } = await supabase
        .from('listings')
        .insert(itemsToInsert)
        .select('id, title, category, subcategory, price, created_at');

    if (insErr) {
        console.error("Error insertando productos:", insErr);
        process.exit(1);
    }

    console.log(`\n¡Éxito! ${inserted.length} mantillas añadidas a Corner Pro:`);
    inserted.forEach(item => {
        console.log(`- [${item.id}] ${item.title}`);
        console.log(`  Categoría: ${item.category} | Subcategoría: ${item.subcategory} | Precio: ${item.price} €`);
        console.log(`  created_at: ${item.created_at}`);
    });

    console.log("\n=== OPERACIÓN COMPLETADA CON ÉXITO ===");
}

run();
