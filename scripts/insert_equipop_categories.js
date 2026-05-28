const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const EQUIPOP_TENANT_ID = '69d55371-2f70-4e67-b55c-4502bce305bb';

// Helper to slugify
const slugify = (text) => text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text

const dataToInsert = [
    // --- CABALLOS ---
    {
        name: "Sillas de montar y accesorios",
        subs: [
            "Sillas de doma", "Sillas de salto", "Sillas western", "Sillas mixtas / uso general",
            "Sillas de raid / endurance", "Sillas treeless", "Sillas barrocas", "Cinchas y latiguillos",
            "Estribos", "Aciones", "Fundas y protectores de silla", "Accesorios para silla"
        ]
    },
    {
        name: "Mantillas y sudaderos",
        subs: [
            "Mantillas de doma", "Mantillas de salto", "Sudaderos western", "Mantillas técnicas",
            "Mantillas personalizadas", "Otros sudaderos y pads"
        ]
    },
    {
        name: "Cabezadas y riendas",
        subs: [
            "Cabezadas de doma", "Cabezadas de salto", "Cabezadas western", "Riendas",
            "Hackamores", "Filetes y bocados", "Muserolas", "Frontaleras", "Accesorios para cabezadas"
        ]
    },
    {
        name: "Protectores y vendas",
        subs: [
            "Protectores delanteros", "Protectores traseros", "Campanas", "Vendas de trabajo",
            "Vendas de descanso", "Protectores de transporte", "Otros protectores"
        ]
    },
    {
        name: "Mantas y ropa para caballos",
        subs: [
            "Mantas de invierno", "Mantas impermeables", "Mantas de cuadra", "Mantas de verano",
            "Mantas de transporte", "Mantas refrescantes", "Cubrenucas", "Cubrecuellos", "Otros textiles para caballo"
        ]
    },
    {
        name: "Cuidado e higiene del caballo",
        subs: [
            "Cepillos y kits de limpieza", "Productos de higiene", "Champús", "Cuidado del casco",
            "Cremas y ungüentos", "Aceites y sprays", "Antimoscas", "Cosmética ecuestre"
        ]
    },
    {
        name: "Alimentación y suplementos",
        subs: [
            "Piensos", "Suplementos nutricionales", "Vitaminas", "Electrolitos", "Snacks y premios",
            "Alimentación premium", "Comederos y bebederos"
        ]
    },
    {
        name: "Herrado y cascos",
        subs: [
            "Botas para cascos", "Herraduras", "Clavos y herramientas", "Productos terapéuticos", "Accesorios de herrado"
        ]
    },
    {
        name: "Trabajo pie a tierra y entrenamiento",
        subs: [
            "Cuerdas y ramales", "Material de cuerda", "Riendas auxiliares", "Ayudas de entrenamiento",
            "Material de lunging", "Conos y obstáculos"
        ]
    },
    {
        name: "Transporte y viaje",
        subs: [
            "Protectores de transporte", "Bolsas y maletas ecuestres", "Redes para heno",
            "Accesorios de remolque", "Cámaras y vigilancia para transporte", "Equipamiento de viaje"
        ]
    },
    {
        name: "Seguridad y visibilidad",
        subs: [
            "Chalecos reflectantes", "Equipamiento LED", "Protectores reflectantes", "Material de seguridad"
        ]
    },
    {
        name: "Equipamiento médico y recuperación",
        subs: [
            "Terapia magnética", "Crioterapia", "Masajeadores", "Botas de recuperación",
            "Equipos veterinarios básicos", "Recuperación muscular"
        ]
    },
    {
        name: "Establo y cuadra",
        subs: [
            "Bebederos automáticos", "Comederos", "Alfombrillas y suelos", "Organización de cuadra",
            "Material de limpieza", "Accesorios de establo"
        ]
    },
    {
        name: "Reproducción y cría",
        subs: [
            "Material de reproducción", "Equipamiento veterinario", "Accesorios para potros", "Lactancia y crianza"
        ]
    },
    {
        name: "Otros productos para caballos",
        subs: [
            "Vintage ecuestre", "Artesanía", "Coleccionismo", "Decoración ecuestre", "Otros accesorios para caballos"
        ]
    },

    // --- RIDERS ---
    {
        name: "Calzado ecuestre",
        subs: [
            "Botas jodhpur", "Botas de montar", "Botines y paddock boots", "Polainas / half chaps",
            "Botas western", "Botas de doma", "Botas de salto", "Calcetines ecuestres", "Accesorios para calzado"
        ]
    },
    {
        name: "Cascos y seguridad",
        subs: [
            "Cascos ecuestres", "Chalecos protectores", "Protectores de espalda", "Airbags ecuestres",
            "Accesorios de seguridad", "Fundas y bolsas para casco"
        ]
    },
    {
        name: "Ropa ecuestre mujer",
        subs: [
            "Pantalones ecuestres mujer", "Leggings ecuestres mujer", "Camisetas y tops mujer",
            "Polos ecuestres mujer", "Sudaderas mujer", "Chaquetas ecuestres mujer", "Chalecos mujer",
            "Ropa de competición mujer", "Impermeables mujer"
        ]
    },
    {
        name: "Ropa ecuestre hombre",
        subs: [
            "Pantalones ecuestres hombre", "Camisetas y polos hombre", "Sudaderas hombre",
            "Chaquetas ecuestres hombre", "Chalecos hombre", "Ropa de competición hombre", "Impermeables hombre"
        ]
    },
    {
        name: "Ropa ecuestre infantil",
        subs: [
            "Pantalones ecuestres infantil", "Camisetas infantiles", "Chaquetas infantiles",
            "Chalecos infantiles", "Ropa de competición infantil", "Cascos infantiles", "Botas infantiles"
        ]
    },
    {
        name: "Guantes ecuestres",
        subs: [
            "Guantes de doma", "Guantes de salto", "Guantes térmicos", "Guantes impermeables", "Guantes de competición"
        ]
    },
    {
        name: "Ropa reflectante y seguridad vial",
        subs: [
            "Chalecos reflectantes", "Bandas reflectantes", "Equipamiento LED", "Accesorios de visibilidad"
        ]
    },
    {
        name: "Fustas, espuelas y ayudas",
        subs: [
            "Fustas", "Fustas de doma", "Fustas de salto", "Espuelas", "Correas para espuelas",
            "Ayudas de entrenamiento", "Otros accesorios de monta"
        ]
    },
    {
        name: "Accesorios para riders",
        subs: [
            "Joyería ecuestre", "Bolsas y mochilas", "Riñoneras", "Gorros y gorras", "Cinturones",
            "Fundas y accesorios", "Botellas y termos", "Otros accesorios ecuestres"
        ]
    },
    {
        name: "Equipamiento de competición",
        subs: [
            "Fracs y chaquetas de concurso", "Camisas de competición", "Corbatas y plastrones",
            "Pantalones blancos de concurso", "Guantes de concurso", "Accesorios FEI"
        ]
    },
    {
        name: "Outdoor y lifestyle ecuestre",
        subs: [
            "Abrigos técnicos", "Ropa térmica", "Ropa casual ecuestre", "Moda ecuestre premium",
            "Ropa waterproof", "Accesorios lifestyle"
        ]
    },
    {
        name: "Bolsas y almacenamiento",
        subs: [
            "Bolsas para botas", "Bolsas para casco", "Maletas ecuestres", "Organizadores", "Mochilas técnicas"
        ]
    },
    {
        name: "Otros productos para riders",
        subs: [
            "Vintage ecuestre", "Artesanía ecuestre", "Decoración ecuestre", "Coleccionismo ecuestre", "Otros productos para riders"
        ]
    }
];

async function insertCategories() {
    console.log(`Starting insertion for Equipop Tenant: ${EQUIPOP_TENANT_ID}`);
    
    // 1. Delete existing Equipop categories to avoid duplicates during test
    const { error: delErr } = await supabase
        .from('categories')
        .delete()
        .eq('tenant_id', EQUIPOP_TENANT_ID);
    
    if (delErr) {
        console.error("Error deleting old categories:", delErr);
        return;
    }
    
    console.log("Deleted old Equipop categories.");

    let globalOrderIndex = 10;

    for (const catData of dataToInsert) {
        const catId = slugify(catData.name);
        
        // Insert Category
        const { data: catInsert, error: catErr } = await supabase
            .from('categories')
            .insert({
                id: catId,
                name: catData.name,
                order_index: globalOrderIndex,
                tenant_id: EQUIPOP_TENANT_ID
            })
            .select()
            .single();

        if (catErr) {
            console.error(`Error inserting category ${catData.name}:`, catErr);
            continue;
        }

        console.log(`Inserted Category: ${catData.name} [${catId}]`);

        // Insert Subcategories
        let subOrderIndex = 10;
        const subsToInsert = catData.subs.map(subName => ({
            category_id: catId,
            name: subName,
            order_index: subOrderIndex += 10,
            tenant_id: EQUIPOP_TENANT_ID
        }));

        const { error: subErr } = await supabase
            .from('subcategories')
            .insert(subsToInsert);

        if (subErr) {
            console.error(`Error inserting subcategories for ${catData.name}:`, subErr);
        } else {
            console.log(`  -> Inserted ${subsToInsert.length} subcategories.`);
        }

        globalOrderIndex += 10;
    }
    
    console.log("Insertion completed successfully.");
}

insertCategories();
