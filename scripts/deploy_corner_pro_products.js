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

const RAW_PRODUCTS = [
    {
        key: 'saddle_jump',
        sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/01/English_saddle.jpg',
        title: 'Silla de Salto Clásica Cuero Vacuno Inglés 17.5"',
        category: 'sillas-de-montar-y-accesorios',
        subcategory: 'Sillas de salto',
        price: 1150,
        price_type: 'fixed',
        shipping_price: 19.50,
        vender_online: true,
        is_featured: true,
        tags: ['silla de salto', 'cuero ingles', '17.5', 'salto de obstaculos', 'montura'],
        description: `Silla de salto en piel de vacuno de primera calidad, asiento semi-profundo de 17,5 pulgadas con tacos ajustables en rodillera y muslera.
Equilibrada, bastes acolchados adaptables al dorso del caballo. Ideal para entrenamiento y concurso de salto de obstáculos.
- Cuero vacuno flexible de primera flor.
- Armazón anatómico con puente intercambiable.
- Bastes anatómicos de lana sintética indeformable.
- Revisada y en estado óptimo.
Incluye funda protectora de algodón de regalo.`
    },
    {
        key: 'saddle_dressage',
        sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/DressageSaddle.jpg',
        title: 'Silla de Doma Clásica Artesanal en Cuero Negro 18"',
        category: 'sillas-de-montar-y-accesorios',
        subcategory: 'Sillas de doma',
        price: 980,
        price_type: 'fixed',
        shipping_price: 19.50,
        vender_online: true,
        is_featured: true,
        tags: ['silla de doma', 'doma clasica', 'cuero negro', '18 pulgadas', 'zaldi'],
        description: `Silla de doma clásica profesional de 18 pulgadas, confeccionada en cuero boxcalf de alta resistencia.
Asiento ergonómico profundo que optimiza el asiento vertical y las ayudas precisas del jinete.
- Faldones largos con taco exterior anatómico para pierna relajada y fija.
- Latiguillos largos de fijación en V para reparto homogéneo de presiones.
- Bastes de látex moldeado.
- Excelente estado y mantenimiento con bálsamo nutritivo.`
    },
    {
        key: 'boots_tall',
        sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Riding_boots_006.jpg',
        title: 'Botas de Equitación de Doma Clásica en Piel Vacuna (Talla 39)',
        category: 'calzado-ecuestre',
        subcategory: 'Botas de Doma',
        price: 295,
        price_type: 'fixed',
        shipping_price: 7.90,
        vender_online: true,
        is_featured: true,
        tags: ['botas de doma', 'cuero vacuno', 'talla 39', 'equitacion', 'calzado'],
        description: `Botas altas técnicas para doma clásica en piel flor seleccionada.
- Cremallera trasera completa YKK reforzada con protección en el talón.
- Protector de espuelas integrado en dos posiciones.
- Forro interior de cuero suave transpirable.
- Suela antideslizante con hendidura técnica para estribo.
- Horma anatómica estilizada con arco de doma elevado.`
    },
    {
        key: 'boots_jodhpur',
        sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Jodhpur_Boots_%2851080437967%29.jpg',
        title: 'Botines de Montar Jodhpur en Cuero con Fuelle Elástico (Talla 41)',
        category: 'calzado-ecuestre',
        subcategory: 'Botines',
        price: 125,
        price_type: 'fixed',
        shipping_price: 5.90,
        vender_online: true,
        is_featured: false,
        tags: ['botines jodhpur', 'cuero', 'talla 41', 'calzado jinete'],
        description: `Botines de montar modelo Jodhpur confeccionados en cuero vacuno engrasado de excelente resistencia.
- Laterales elásticos para un calce rápido y ceñido al tobillo.
- Tira trasera de agarre para facilitar la colocación.
- Suela de caucho vulcanizado resistente a la abrasión y estrías para el estribo.
- Perfectos para el día a día en la cuadra, pista y combinación con polainas.`
    },
    {
        key: 'helmet_pro',
        sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Riding_helmet.jpg',
        title: 'Casco de Seguridad de Equitación Homologado VG1 con Ventilación',
        category: 'cascos-y-seguridad',
        subcategory: 'Cascos',
        price: 165,
        price_type: 'fixed',
        shipping_price: 6.50,
        vender_online: true,
        is_featured: true,
        tags: ['casco equitacion', 'seguridad', 'homologado vg1', 'ventilacion'],
        description: `Casco ecuestre de protección integral con certificación oficial de seguridad VG1 01.040.
- Carcasa exterior ABS ultra-resistente contra impactos y disipación de energía.
- Sistema de ventilación multicanal de flujo continuo con rejillas de aluminio.
- Rueda de ajuste occipital milimétrico para calce anatómico seguro.
- Acolchado interior Coolmax antibacteriano, desmontable y lavable a máquina.
- Visera flexible de seguridad.`
    },
    {
        key: 'helmet_classic',
        sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/58/HuntCap.jpg',
        title: 'Casco Tradicional de Terciopelo para Concurso y Exhibición',
        category: 'cascos-y-seguridad',
        subcategory: 'Cascos',
        price: 95,
        price_type: 'fixed',
        shipping_price: 6.50,
        vender_online: true,
        is_featured: false,
        tags: ['casco terciopelo', 'hunt cap', 'concurso', 'elegancia ecuestre'],
        description: `Casco clásico estilo inglés revestido en terciopelo negro de alta densidad con lazo trasero tradicional.
- Ideal para concursos de doma, presentación, desfiles y picadero tradicional.
- Arnés de sujeción de seguridad de 3 puntos con cierre rápido acolchado en barbilla.
- Estructura rígida interior con forro transpirable.
- Elegancia y distinción atemporal.`
    },
    {
        key: 'blanket_winter',
        sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Winterblanket.jpg',
        title: 'Manta de Invierno para Caballo Impermeable Ripstop 1200D 300g',
        category: 'mantas',
        subcategory: 'Mantas de invierno',
        price: 145,
        price_type: 'fixed',
        shipping_price: 8.50,
        vender_online: true,
        is_featured: true,
        tags: ['manta invierno', 'ripstop 1200d', '300g', 'impermeable', 'caballo'],
        description: `Manta de exterior para caballo confeccionada en tejido Ripstop de 1200 deniers altamente resistente a desgarros e impermeable.
- Relleno térmico de fibra de 300 gramos transpirable para bajas temperaturas.
- Doble cierre frontal de mosquetón con velcro de seguridad adicional.
- Fuelles de holgura en hombros para libre movimiento durante el pasto.
- Cinchuelos cruzados ajustables y correas para extremidades traseras.
- Talla estándar 145 cm.`
    },
    {
        key: 'halter_leather',
        sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Horse_in_halter_-_1.jpg',
        title: 'Cabezada de Cuadra y Pasto en Cuero Engrasado Reforzada',
        category: 'establo-y-cuadra',
        subcategory: 'Cabezadas de cuadra',
        price: 55,
        price_type: 'fixed',
        shipping_price: 4.90,
        vender_online: true,
        is_featured: false,
        tags: ['cabezada de cuadra', 'cuero engrasado', 'herrajes laton', 'caballos'],
        description: `Cabezada de cuadra y transporte fabricada en cuero vacuno engrasado flexible.
- Almohadillado ergonómico en testera y muserola para prevenir rozaduras y presiones.
- Herrajes de latón macizo antioxidable con mosquetón de apertura rápida en ahogadero.
- Ajuste doble con hebillas a ambos lados de la nuca para centrado simétrico.
- Talla Full.`
    },
    {
        key: 'bits_snaffle',
        sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Various_Snaffle_Bits.jpg',
        title: 'Lote de Filetes de Anillas Anatómicos en Acero Inoxidable',
        category: 'bocados-y-filetes',
        subcategory: 'Filetes',
        price: 68,
        price_type: 'fixed',
        shipping_price: 4.90,
        vender_online: true,
        is_featured: false,
        tags: ['filetes', 'anillas', 'acero inoxidable', 'bocados', 'embocaduras'],
        description: `Conjunto de filetes de anillas con embocadura anatómica de doble articulación y oliva central pulida.
- Fabricados en acero inoxidable quirúrgico de grado alimentario pulido a espejo.
- Estimula la salivación suave y la relajación de la mandíbula sin efecto cascanueces.
- Grosor de cañón 16 mm con anillas de 65 mm de diámetro.
- Disponibles en medidas 12.5 cm y 13.5 cm.`
    },
    {
        key: 'grooming_set',
        sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/HorseGroomingTools.jpg',
        title: 'Maletín Completo de Limpieza y Aseo Ecuestre (8 Piezas)',
        category: 'cuidado-e-higiene-del-caballo',
        subcategory: 'Cepillos y kits de limpieza',
        price: 48,
        price_type: 'fixed',
        shipping_price: 5.50,
        vender_online: true,
        is_featured: true,
        tags: ['kit de limpieza', 'cepillos caballo', 'maletin aseo', 'higiene ecuestre'],
        description: `Kit profesional de higiene y acicalamiento para caballos compuesto por 8 piezas esenciales en maletín rígido transportable:
1. Rasqueta de goma flexible para eliminar suciedad y pelo muerto.
2. Cepillo de raíces Dandy para desbastar.
3. Cepillo suave de pelo fino para cuerpo y lustre.
4. Limpiacascos reforzado con cepillo de cerdas duras.
5. Peine metálico con mango antideslizante para crines y cola.
6. Esponja suave de poro fino para ojos y ollares.
7. Sudador anatómico de goma y filo plástico.
8. Brocha con bote para grasa de cascos.`
    },
    {
        key: 'grooming_dandy',
        sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/95/DandyBrushes.jpg',
        title: 'Cepillo de Raíces Dandy Brush de Madera con Fibras Naturales',
        category: 'cuidado-e-higiene-del-caballo',
        subcategory: 'Cepillos y kits de limpieza',
        price: 18,
        price_type: 'fixed',
        shipping_price: 3.90,
        vender_online: true,
        is_featured: false,
        tags: ['dandy brush', 'cepillo de raices', 'fibras naturales', 'limpieza caballo'],
        description: `Cepillo dandy tradicional con bloque anatómico de madera de haya barnizada y cerdas de fibra vegetal dura.
- Eficacia sobresaliente eliminando barro seco incrustado y polvo adherido al dorso y flancos.
- Cerdas de 6 cm de longitud que llegan a la base del pelaje.
- Diseño redondeado con hendiduras laterales para sujeción cómoda y firme.`
    },
    {
        key: 'grooming_soft',
        sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/45/SoftHorseBrush.jpg',
        title: 'Cepillo Suave de Cabello Natural para Brillo y Cabeza',
        category: 'cuidado-e-higiene-del-caballo',
        subcategory: 'Cepillos y kits de limpieza',
        price: 16,
        price_type: 'fixed',
        shipping_price: 3.90,
        vender_online: true,
        is_featured: false,
        tags: ['cepillo suave', 'cerdas naturales', 'brillo pelaje', 'aseo cara caballo'],
        description: `Cepillo de acabado de tacto supersuave elaborado con cerdas 100% naturales de pelo fino y correa de mano en piel.
- Apto para las zonas más sensibles: cara, cabeza, ollares y orejas.
- Elimina partículas de polvo fino flotante y deja un brillo sedoso en la capa del caballo.
- Base ergonómica de madera tratada contra humedad.`
    }
];

async function run() {
    console.log("=== INICIANDO CONFIGURACIÓN DE PRODUCTOS GÉNERICOS PARA CORNER PRO ===");

    // 1. Eliminar anuncios anteriores del usuario ghost
    console.log("1. Eliminando anuncios anteriores de Corner Pro...");
    const { data: deleted, error: delErr } = await supabase
        .from('listings')
        .delete()
        .eq('user_id', GHOST_USER_ID);

    if (delErr) {
        console.error("Error al eliminar anuncios anteriores:", delErr);
        process.exit(1);
    }
    console.log("Anuncios anteriores eliminados con éxito.");

    // 2. Descargar cada foto stock libre y subirla a Supabase Storage (wpublic/corner-pro/)
    console.log("2. Descargando y subiendo imágenes stock genéricas a Supabase Storage (wpublic/corner-pro/)...");
    const uploadedProducts = [];

    for (const prod of RAW_PRODUCTS) {
        console.log(`- Procesando imagen para: ${prod.key} (${prod.title})...`);
        const res = await fetch(prod.sourceUrl, {
            headers: { 'User-Agent': 'CornerProBot/1.0 (info@equipop.app)' }
        });

        if (!res.ok) {
            console.error(`Error descargando imagen desde ${prod.sourceUrl}: HTTP ${res.status}`);
            continue;
        }

        const buffer = Buffer.from(await res.arrayBuffer());
        const filePath = `corner-pro/${prod.key}.jpg`;

        const { error: upErr } = await supabase.storage
            .from('wpublic')
            .upload(filePath, buffer, {
                contentType: 'image/jpeg',
                upsert: true
            });

        if (upErr) {
            console.error(`Error subiendo a Supabase Storage ${filePath}:`, upErr);
            continue;
        }

        const publicUrl = supabase.storage
            .from('wpublic')
            .getPublicUrl(filePath).data.publicUrl;

        console.log(`  -> Subida exitosa: ${publicUrl}`);

        uploadedProducts.push({
            title: prod.title,
            description: prod.description,
            price: prod.price,
            price_type: prod.price_type,
            shipping_price: prod.shipping_price,
            vender_online: prod.vender_online,
            is_featured: prod.is_featured,
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
            municipality_id: 28079,
            contact_phone: '+34 918 420 891',
            status: 'active'
        });
    }

    console.log(`Total productos listos con fotos genéricas propias: ${uploadedProducts.length}`);

    // 3. Insertar nuevos productos en la base de datos
    console.log("3. Insertando productos en public.listings...");
    const { data: inserted, error: insErr } = await supabase
        .from('listings')
        .insert(uploadedProducts)
        .select('id, title');

    if (insErr) {
        console.error("Error al insertar nuevos listings:", insErr);
        process.exit(1);
    }

    console.log(`¡Insertados con éxito ${inserted.length} anuncios para Corner Pro!`);
    inserted.forEach(i => console.log(`  * [${i.id}] ${i.title}`));

    console.log("\n=== FINALIZADO CON ÉXITO ===");
}

run();
