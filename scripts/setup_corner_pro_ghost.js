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
const GHOST_TOKEN = '7956f1c0-7cc2-4311-959b-07c76caccb11';
const LOGO_URL = 'https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/wpublic/avatars/corner-pro-logo.png';

const COMPANY_DATA = {
    commercial_name: 'Corner Pro',
    name: 'Corner Pro',
    email: 'cornerpro_ghost@equipop.app',
    company_description: 'Corner Pro | Tienda especializada en equipamiento ecuestre de alta gama y material técnico para jinete y caballo. Distribuidores oficiales de las principales marcas del sector: sillas de montar a medida, guarnicionería premium, bocados y filetes anatómicos, ropa técnica de competición, cascos homologados y artículos de cuidado e higiene de primera calidad. Asesoramiento profesional y envíos a toda la península.',
    company_address: 'Avenida del Caballo 14',
    company_zip: '28232',
    company_country: 'Madrid, España',
    location: 'Madrid (Madrid)',
    province_id: 28,
    municipality_id: 28079,
    contact_phone: '+34 918 420 891',
    company_website: 'https://cornerpro.es',
    avatar_url: LOGO_URL,
    company_logo_url: LOGO_URL,
    role: 'profesional',
    plan_type: 'pro',
    is_ghost: true,
    ghost_token: GHOST_TOKEN,
    tenant_id: EQUIPOP_TENANT_ID,
};

const PRODUCTS = [
    {
        title: 'Silla de Salto Prestige Roma Jump 17,5" Cuero Doble',
        category: 'sillas-de-montar-y-accesorios',
        subcategory: 'Sillas de salto',
        price: 1290,
        price_type: 'fixed',
        shipping_price: 18.50,
        vender_online: true,
        is_featured: true,
        image_urls: [
            'https://media.ruralpop.com/listings/2026/09/1w4xibfgque-710e2e3a-e14a-428b-8e70-1cde434f1b2f-1788694174693-0.jpg'
        ],
        tags: ['silla de salto', 'prestige', 'cuero doble', 'roma jump', '17.5'],
        description: `Silla de salto Prestige modelo Roma Jump en 17,5 pulgadas.
Confeccionada en piel de vacuno de primera calidad con faldones acolchados y rodilleras anatómicas termoformadas para un ajuste perfecto y máxima seguridad en el salto.
- Asiento medio-profundo muy equilibrado.
- Taco trasero ajustable.
- Bastes de látex indeformables adaptables al dorso del caballo.
- En perfecto estado, revisada en taller oficial.
Incluye funda protectora original Prestige de regalo.`
    },
    {
        title: 'Silla de Doma Clásica Zaldi Royal 18" Cuero Boxcalf',
        category: 'sillas-de-montar-y-accesorios',
        subcategory: 'Sillas de doma',
        price: 890,
        price_type: 'fixed',
        shipping_price: 18.50,
        vender_online: true,
        is_featured: true,
        image_urls: [
            'https://media.ruralpop.com/listings/2026/06/jkj48q0v27-qkv6p3.webp'
        ],
        tags: ['silla de doma', 'zaldi', 'doma clasica', 'boxcalf', '18 pulgadas'],
        description: `Silla de doma clásica Zaldi modelo Royal de 18 pulgadas.
Asiento profundo muy confortable que facilita la posición vertical natural del jinete y el contacto estrecho con el caballo.
- Cuero de crupón y boxcalf seleccionado de máxima durabilidad.
- Rodillera exterior anatómica para soporte óptimo de la pierna.
- Bastes de lana natural transpirable.
- Latiguillos largos de doma en excelente estado.
Garantía de calidad Corner Pro.`
    },
    {
        title: 'Chaleco Protector Airbag de Equitación Helite Zip\'In 2 Homologado',
        category: 'cascos-y-seguridad',
        subcategory: 'Chalecos Airbag',
        price: 495,
        price_type: 'fixed',
        shipping_price: 8.90,
        vender_online: true,
        is_featured: true,
        image_urls: [
            'https://media.ruralpop.com/listings/2026/07/47m19u9b65r-ef194702-30dc-418a-9360-c5da7baba87d-1785161917473-0.jpg'
        ],
        tags: ['airbag', 'helite', 'seguridad', 'chaleco protector', 'homologado'],
        description: `Chaleco airbag de protección integral para equitación Helite Zip'In 2.
Máxima seguridad certificada CE EN 13158 nivel 2.
- Protege cuello, columna cervical, tórax, costillas, espalda y coxis en caso de caída en menos de 100 milisegundos.
- Muy ligero y transpirable, corte ergonómico que permite total libertad de movimientos.
- Puede llevarse de forma independiente o integrado bajo chaquetas de concurso compatibles.
Incluye cordón de conexión a la montura y cartucho de CO2 precargado listo para usar.`
    },
    {
        title: 'Casco de Seguridad UVEX Exxential II con MIPS',
        category: 'cascos-y-seguridad',
        subcategory: 'Cascos',
        price: 179,
        price_type: 'fixed',
        shipping_price: 6.50,
        vender_online: true,
        is_featured: false,
        image_urls: [
            'https://media.ruralpop.com/listings/2026/07/nha52s0z6b-fd02bc77-9af6-4628-af48-cdcf53008afa-1783964188701-0.jpg'
        ],
        tags: ['casco', 'uvex', 'mips', 'seguridad ecuestre', 'vg1'],
        description: `Casco de equitación de última generación UVEX Exxential II MIPS.
Incorpora la tecnología de protección cerebral MIPS contra impactos con rotación oblicua.
- Estructura In-Mould ultraligera (peso aprox. 430g).
- Sistema de regulación milimétrica 3D IAS para un ajuste anatómico perfecto.
- Canales de ventilación continua que evitan la acumulación de calor.
- Forro interior desmontable y lavable.
Homologado bajo la estricta normativa de seguridad VG1 01.040.`
    },
    {
        title: 'Botines de Cuero Premium con Cremallera y Cordón Elástico',
        category: 'calzado-ecuestre',
        subcategory: 'Botines',
        price: 135,
        price_type: 'fixed',
        shipping_price: 6.50,
        vender_online: true,
        is_featured: true,
        image_urls: [
            'https://media.ruralpop.com/listings/2026/08/9eftc79gis-5s4vel.webp'
        ],
        tags: ['botines', 'cuero', 'calzado', 'premium', 'cordones'],
        description: `Nuevos con etiqueta. Botines técnicos de equitación fabricados en cuero vacuno europeo de plena flor.
- Cremallera frontal reforzada YKK para un calce rápido y cómodo.
- Cordones elásticos en el empeine para máxima flexibilidad al apoyar en el estribo.
- Fuelle elástico lateral de ajuste ceñido al tobillo.
- Suela técnica antideslizante con absorción de impacto y hendidura especial para estribos.
Disponibles en varias tallas (38 a 44). Consultar disponibilidad.`
    },
    {
        title: 'Botas de Doma Clásica Artesanales en Cuero Negro (Talla 39)',
        category: 'calzado-ecuestre',
        subcategory: 'Botas de Doma',
        price: 320,
        price_type: 'fixed',
        shipping_price: 9.90,
        vender_online: true,
        is_featured: false,
        image_urls: [
            'https://media.ruralpop.com/listings/2026/08/kmh1v1h79g-0577f9b3-cd54-4d5f-8ddc-957bc0f3b655-1787575957553-0.jpg'
        ],
        tags: ['botas', 'doma', 'cuero negro', 'artesanal', 'talla 39'],
        description: `Elegantes botas altas de doma confeccionadas a mano en cuero de grano superior.
- Caña exterior rígida con corte español que estiliza la pierna.
- Interior suave para un contacto directo y sensible con el caballo.
- Cremallera interior adelantada con protector de espuela en el talón.
- Suela de goma vulcanizada cosida artesanalmente.
Talla 39 (Altura: 47 cm / Gemelo: 36 cm). Estado impecable.`
    },
    {
        title: 'Protectores de Salto Veredus Carbon Gel con Borreguillo Save the Sheep',
        category: 'protectores-y-vendas',
        subcategory: 'Protectores delanteros',
        price: 145,
        price_type: 'fixed',
        shipping_price: 6.50,
        vender_online: true,
        is_featured: true,
        image_urls: [
            'https://media.ruralpop.com/listings/2026/06/7kz5n77rogd-plvvcf.webp'
        ],
        tags: ['protectores', 'veredus', 'carbon gel', 'borreguillo', 'salto'],
        description: `Protectores anatómicos de salto Veredus Carbon Gel con forro interior de borreguillo sintético Save the Sheep.
- Carcasa exterior de poliuretano antichoque con refuerzo central de fibra de carbono y gel amortiguador.
- El forro hipoalergénico previene quemaduras por rozadura y es facilísimo de lavar.
- Doble cierre elástico con botones de liberación rápida de alta durabilidad.
Talla M (caballo estándar). Ideales para competición y entrenamiento de alto nivel.`
    },
    {
        title: 'Cabezada de Doma Anatómica Dy\'on de Cuero Inglés con Frontalera Swarovski',
        category: 'cabezadas-y-riendas',
        subcategory: 'Muserolas y frontaleras',
        price: 185,
        price_type: 'fixed',
        shipping_price: 6.50,
        vender_online: true,
        is_featured: true,
        image_urls: [
            'https://media.ruralpop.com/listings/2026/07/2jikmrnlz65-k8d1ei.webp'
        ],
        tags: ['cabezada', 'dyon', 'cuero ingles', 'swarovski', 'muserola'],
        description: `Exclusiva cabezada de filete Dy'on confeccionada en cuero inglés de curtición vegetal de primera calidad.
- Testera anatómica con almohadilla de gel que libera la presión sobre la nuca y orejas.
- Frontalera curvada en onda decorada con auténticos cristales Swarovski brillantes.
- Muserola ancha pull-back forrada en cuero extra suave para máxima comodidad mandibular.
- Hebillas de acero inoxidable plateado.
Talla Full. Incluye riendas engomadas a juego.`
    },
    {
        title: 'Conjunto Mantilla y Orejeras Cavalleria Toscana Talla Full',
        category: 'mantillas-y-salvacruces',
        subcategory: 'Mantillas de doma',
        price: 98,
        price_type: 'fixed',
        shipping_price: 5.95,
        vender_online: true,
        is_featured: false,
        image_urls: [
            'https://media.ruralpop.com/listings/2026/07/9tulb9u06w-6a14f908-d125-4b02-9d9f-e271737d4c2b-1785262681961-0.jpg'
        ],
        tags: ['mantilla', 'cavalleria toscana', 'orejeras', 'doma', 'conjunto'],
        description: `Precioso conjunto de mantilla de doma y orejeras a juego de la prestigiosa marca Cavalleria Toscana.
- Tejido exterior técnico en piqué con acolchado geométrico elegante y ribete refinado.
- Interior de nido de abeja 100% algodón que absorbe rápidamente el sudor y evita irritaciones.
- Orejeras con orejeras elásticas de lycra silenciosas para mejorar la concentración del caballo.
Color azul marino con logotipo CT bordado.`
    },
    {
        title: 'Salvacruces Ortopédico Winderen Back Protect Solution 18mm',
        category: 'mantillas-y-salvacruces',
        subcategory: 'Salvacruces',
        price: 195,
        price_type: 'fixed',
        shipping_price: 6.90,
        vender_online: true,
        is_featured: true,
        image_urls: [
            'https://media.ruralpop.com/listings/2026/07/gg0ad4aayl-70b87d6a-ffc2-4445-b33d-455919f714a2-1785097120213-0.jpg'
        ],
        tags: ['salvacruces', 'winderen', 'ortopedico', 'back protect', 'dorso'],
        description: `Salvacruces de alta tecnología Winderen Back Protect Solution (18mm de grosor).
Diseñado con un sistema multicapa que absorbe y disipa hasta el 89% de los impactos y vibraciones producidos durante la monta.
- Alivia la tensión muscular en el dorso del caballo y la espalda del jinete.
- Compensa pequeñas asimetrías de la montura.
- Funda exterior de microfibra de alta resistencia, extraíble y lavable en lavadora.
Recomendado por veterinarios y jinetes de élite internacional.`
    },
    {
        title: 'Manta de Exterior Impermeable Ripstop 1200D 350g con Cuello',
        category: 'mantas',
        subcategory: 'Mantas de invierno',
        price: 125,
        price_type: 'fixed',
        shipping_price: 9.90,
        vender_online: true,
        is_featured: false,
        image_urls: [
            'https://media.ruralpop.com/listings/2026/07/p81my1usrt7-6f1ks5w.webp'
        ],
        tags: ['manta de invierno', 'impermeable', '1200d', 'ripstop', 'cuello'],
        description: `Manta térmica de prado y exterior de máxima durabilidad fabricada en tejido antidesgarro Ripstop 1200 Deniers.
- Relleno térmico de 350 gramos de fibra termofijada muy cálida.
- 100% impermeable (columna de agua 5000 mm) y altamente transpirable.
- Fuelles laterales amplios en las espaldas para total libertad de paso.
- Cinchuelos cruzados ajustables, solapa de cola reforzada y cubre-cuello desmontable incluido.
Tallas disponibles: 135 cm, 145 cm y 155 cm.`
    },
    {
        title: 'Manta Polar Secante Anti-Pilling con Cierre Frontal Reforzado',
        category: 'mantas',
        subcategory: 'Mantas impermeables',
        price: 45,
        price_type: 'fixed',
        shipping_price: 5.95,
        vender_online: true,
        is_featured: false,
        image_urls: [
            'https://media.ruralpop.com/listings/2026/09/bhq03zgavbs-c32246e3-f21b-42f0-9512-b493c8ded7d3-1788950763953-0.jpg'
        ],
        tags: ['manta secante', 'polar', 'anti-pilling', 'secado rapido', 'transporte'],
        description: `Manta de secado ultra-rápido confeccionada en suave tejido polar de microfibra anti-pilling de alta densidad.
- Absorbe la humedad del pelaje y la expulsa al exterior en pocos minutos, protegiendo al caballo de enfriamientos tras el trabajo.
- Cierre frontal doble con hebillas de acero inoxidable y refuerzo de velcro.
- Cordón de cola trenzado.
Ideal también como manta de presentación, transporte o bajo-manta.`
    },
    {
        title: 'Pantalón de Montar Mujer REBEL Full Grip Silicona Talla 38',
        category: 'ropa-ecuestre-mujer',
        subcategory: 'Pantalones y leggins',
        price: 85,
        price_type: 'fixed',
        shipping_price: 5.50,
        vender_online: true,
        is_featured: false,
        image_urls: [
            'https://media.ruralpop.com/listings/2026/08/ddk0x0iu3ic-3xrtp.webp'
        ],
        tags: ['pantalones', 'rebel', 'grip silicona', 'mujer', 'talla 38'],
        description: `Nuevo a estrenar con etiquetas. Pantalón técnico de amazona REBEL by Montar confeccionado en denim elástico de alta resistencia.
- Tejido 4-way stretch muy cómodo que se adapta a cada figura sin apretar.
- Grip completo de silicona en asiento y rodillas para una fijación perfecta en la montura.
- Cintura media-alta anatómica con trabillas para cinturón.
- Bolsillo lateral con cremallera especial para teléfono móvil.
Talla 38 española.`
    },
    {
        title: 'Polo Técnico de Competición Mujer Ariat Manga Corta',
        category: 'ropa-ecuestre-mujer',
        subcategory: 'Camisas y polos de competición',
        price: 52,
        price_type: 'fixed',
        shipping_price: 4.95,
        vender_online: true,
        is_featured: false,
        image_urls: [
            'https://media.ruralpop.com/listings/2026/07/g1b0b7sujk-fd02bc77-9af6-4628-af48-cdcf53008afa-1783967617084-0.jpg'
        ],
        tags: ['polo concurso', 'ariat', 'competicion', 'tecnico', 'moisture movement'],
        description: `Polo oficial de concurso para jinete/amazona de la prestigiosa marca Ariat.
- Confeccionado con tejido técnico ultraligero con tecnología Moisture Movement que mantiene la piel seca y fresca en jornadas calurosas.
- Cuello blanco reglamentario para concurso con cierre magnético oculto.
- Paneles laterales de malla microporosa para máxima transpiración.
- Logo Ariat bordado de forma discreta en el pecho.
Talla M.`
    },
    {
        title: 'Suplemento Articular TRM Stride MP Condroprotector 1,5 kg',
        category: 'alimentacin-y-suplementos',
        subcategory: 'Suplementos nutricionales',
        price: 68,
        price_type: 'fixed',
        shipping_price: 6.50,
        vender_online: true,
        is_featured: false,
        image_urls: [
            'https://media.ruralpop.com/listings/2026/07/9ny1hvkt5ap-6a14f908-d125-4b02-9d9f-e271737d4c2b-1785263929367-0.jpg'
        ],
        tags: ['trm', 'suplemento', 'stride mp', 'articular', 'condroprotector'],
        description: `Programa nutricional para el mantenimiento del cartílago y las articulaciones de caballos en entrenamiento activo o caballos mayores.
- Contiene Glucosamina HCL de máxima biodisponibilidad, Condroitín Sulfato y MSM (metilsulfonilmetano).
- Aporta azufre biodisponible esencial para la síntesis de colágeno y tejido conectivo.
- Favorece la fluidez y elasticidad del movimiento.
Envase precintado de 1,5 kg con cacito dosificador incluido. Producto de uso veterinario.`
    },
    {
        title: 'Baúl Guardarnés de Concurso Móvil Facetbox para 2 Monturas',
        category: 'transporte-y-viaje',
        subcategory: 'Equipamiento de viaje',
        price: 680,
        price_type: 'fixed',
        shipping_price: 35.00,
        vender_online: true,
        is_featured: true,
        image_urls: [
            'https://media.ruralpop.com/listings/2026/09/udtrgtbv6p-752888e5-7bfb-49e6-a032-9c3efc94b3df-1789064835451-0.jpg'
        ],
        tags: ['baul guardarnes', 'facetbox', 'concurso', 'transporte', 'monturas'],
        description: `Baúl guardarnés móvil profesional Facetbox para transporte en camión, remolque o guadarnés.
- Estructura de chapa de acero galvanizado con pintura al horno anticorrosión.
- Capacidad para 2 monturas (soportes extensibles acolchados).
- 3 cajones deslizables interiores para guardar cabezadas, vendas, fustas y productos de aseo.
- 4 ruedas neumáticas de alta resistencia (2 de ellas giratorias con freno de estacionamiento).
- Cerradura de seguridad con llave.
Imprescindible para desplazamientos a campeonatos y competiciones hípicas.`
    }
];

async function setupCornerPro() {
    console.log("=== Actualizando Perfil Ghost 'Corner Pro' en Equipop ===");

    // 1. Actualizar usuario en tabla users
    const { data: updatedUser, error: userError } = await supabase
        .from('users')
        .update(COMPANY_DATA)
        .eq('id', GHOST_USER_ID)
        .select();

    if (userError) {
        console.error("Error al actualizar usuario ghost:", userError);
        return;
    }
    console.log("Usuario ghost actualizado con éxito:", updatedUser[0].commercial_name);

    // 2. Limpiar listings anteriores de este usuario
    console.log("Eliminando listings anteriores del usuario...");
    const { error: delError } = await supabase
        .from('listings')
        .delete()
        .eq('user_id', GHOST_USER_ID);

    if (delError) {
        console.error("Error al limpiar listings antiguos:", delError);
    } else {
        console.log("Listings antiguos eliminados.");
    }

    // 3. Insertar los 16 productos de catálogo ecuestre
    console.log(`Insertando ${PRODUCTS.length} productos profesionales para Corner Pro...`);

    for (const [index, prod] of PRODUCTS.entries()) {
        const listingRecord = {
            user_id: GHOST_USER_ID,
            tenant_id: EQUIPOP_TENANT_ID,
            title: prod.title,
            description: prod.description,
            price: prod.price,
            price_type: prod.price_type,
            category: prod.category,
            subcategory: prod.subcategory,
            equipop_category: prod.category,
            equipop_subcategory: prod.subcategory,
            location: COMPANY_DATA.location,
            province_id: COMPANY_DATA.province_id,
            municipality_id: COMPANY_DATA.municipality_id,
            contact_phone: COMPANY_DATA.contact_phone,
            vender_online: prod.vender_online,
            shipping_price: prod.shipping_price,
            is_featured: prod.is_featured,
            status: 'active',
            image_urls: prod.image_urls,
            tags: prod.tags,
            created_at: new Date(Date.now() - (PRODUCTS.length - index) * 3600000).toISOString()
        };

        const { data: inserted, error: insertError } = await supabase
            .from('listings')
            .insert([listingRecord])
            .select('id, title, price');

        if (insertError) {
            console.error(`Error insertando producto [${prod.title}]:`, insertError.message);
        } else {
            console.log(`[${index + 1}/${PRODUCTS.length}] Producto creado: "${inserted[0].title}" (${inserted[0].price}€)`);
        }
    }

    // 4. Limpiar cualquier registro huérfano con email de cabalandia
    await supabase
        .from('users')
        .delete()
        .eq('id', 'ec08d1f3-4fdc-40c3-b3a7-3059776355f3')
        .is('tenant_id', null);

    console.log("\n=============================================");
    console.log("¡EMPRESA GHOST 'CORNER PRO' CREADA CON ÉXITO!");
    console.log(`Enlace Mágico: /empresa/corner-pro?token=${GHOST_TOKEN}`);
    console.log(`URL Completa Equipop: https://www.equipop.app/empresa/corner-pro?token=${GHOST_TOKEN}`);
    console.log("=============================================");
}

setupCornerPro();
