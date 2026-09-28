const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const GHOST_USER_ID = '5902a215-7d21-4068-9971-4effd6a0448c';

const ORDERED_ITEMS = [
    { title: 'Silla Inglesa Doma Clásica Bates Artiste', second: 14 },
    { title: 'Silla Inglesa Doma Arena Monoflap', second: 13 },
    { title: 'Silla de Salto Kieffer Jump Vario', second: 12 },
    { title: 'Silla Kieffer de Salto Palmanova', second: 11 },
    { title: 'Botas de Equitación de Doma Clásica en Piel Vacuna (Talla 39)', second: 10 },
    { title: 'Botines de Montar Jodhpur en Cuero con Fuelle Elástico (Talla 41)', second: 9 },
    { title: 'Casco de Seguridad de Equitación Homologado VG1 con Ventilación', second: 8 },
    { title: 'Casco Tradicional de Terciopelo para Concurso y Exhibición', second: 7 },
    { title: 'Manta de Invierno para Caballo Impermeable Ripstop 1200D 300g', second: 6 },
    { title: 'Cabezada de Cuadra y Pasto en Cuero Engrasado Reforzada', second: 5 },
    { title: 'Lote de Filetes de Anillas Anatómicos en Acero Inoxidable', second: 4 },
    { title: 'Maletín Completo de Limpieza y Aseo Ecuestre (8 Piezas)', second: 3 },
    { title: 'Cepillo de Raíces Dandy Brush de Madera con Fibras Naturales', second: 2 },
    { title: 'Cepillo Suave de Cabello Natural para Brillo y Cabeza', second: 1 }
];

async function updateDates() {
    console.log("=== ACTUALIZANDO FECHAS DE CORNER PRO A FECHAS HISTÓRICAS (2020) ===");

    const { data: listings, error } = await supabase
        .from('listings')
        .select('id, title')
        .eq('user_id', GHOST_USER_ID);

    if (error) {
        console.error("Error al obtener listings:", error);
        process.exit(1);
    }

    console.log(`Encontrados ${listings.length} productos de Corner Pro.`);

    for (const item of listings) {
        const found = ORDERED_ITEMS.find(o => item.title.includes(o.title) || o.title.includes(item.title));
        const second = found ? found.second : 0;
        const secStr = String(second).padStart(2, '0');
        const oldDate = `2020-01-01T12:00:${secStr}.000Z`;

        const { error: upErr } = await supabase
            .from('listings')
            .update({
                created_at: oldDate,
                is_featured: false,
                featured_until: null
            })
            .eq('id', item.id);

        if (upErr) {
            console.error(`Error actualizando [${item.id}] ${item.title}:`, upErr);
        } else {
            console.log(`✓ [${oldDate}] is_featured: false -> ${item.title}`);
        }
    }

    console.log("\n=== ACTUALIZACIÓN COMPLETADA CON ÉXITO ===");
}

updateDates();
