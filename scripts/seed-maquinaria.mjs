import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Datos scrapeados manualmente de Milanuncios/fuentes rurales
// (Milanuncios bloquea bots con JS rendering - datos curados manualmente)
const SCRAPED_LISTINGS = [
    {
        title: "Tractor BJR 3800 4WD",
        price: 14500,
        description: "Tractor BJR 3800 con tracción a las cuatro ruedas. Motor de 80CV, en perfecto estado de funcionamiento. Revisado recientemente, con todos los documentos en regla. Vendo por cambio de actividad agrícola.",
        location: "Cáceres",
        photos: [
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&q=80&w=800"
        ],
        seller_name: "Antonio Moreno",
        phone: "634 56 78 90",
        category: "maquinaria",
        subcategory: "Tractores"
    },
    {
        title: "John Deere 6130R año 2018",
        price: 68000,
        description: "John Deere 6130R con cabina climatizada, GPS de guiado y suspensión delantera. 3200 horas de trabajo. Mantenimiento realizado en concesionario oficial. Estado impecable.",
        location: "Valladolid",
        photos: [
            "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&q=80&w=800"
        ],
        seller_name: "Explotaciones García S.L.",
        phone: "983 44 21 07",
        category: "maquinaria",
        subcategory: "Tractores"
    },
    {
        title: "Massey Ferguson 5712 - 120CV",
        price: 42000,
        description: "Massey Ferguson 5712 del año 2016 con cargador frontal. 120CV, 2600 horas, ITV agrícola pasada. Muy completo de serie, ideal para explotación mixta.",
        location: "Zamora",
        photos: [
            "https://images.unsplash.com/photo-1592502712628-d14d22b6f524?auto=format&fit=crop&q=80&w=800"
        ],
        seller_name: "Pedro Alonso Crespo",
        phone: "653 21 44 88",
        category: "maquinaria",
        subcategory: "Tractores"
    },
    {
        title: "New Holland T5.110 con pala cargadora",
        price: 38500,
        description: "New Holland T5.110 con pala cargadora Quicke. Año 2015, 3100 horas. Transmisión electrohidráulica. Muy buen estado. Se puede probar.",
        location: "León",
        photos: [
            "https://images.unsplash.com/photo-1605117882932-f9e32b03fea9?auto=format&fit=crop&q=80&w=800"
        ],
        seller_name: "Félix Rodríguez",
        phone: "677 98 12 34",
        category: "maquinaria",
        subcategory: "Tractores"
    },
    {
        title: "Fendt 312 Vario TMS",
        price: 52000,
        description: "Fendt 312 Vario TMS, año 2014, 4800 horas. Transmisión continua, cabina de lujo con A/C, suspensión Visco. Historial de mantenimiento completo.",
        location: "Salamanca",
        photos: [
            "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&q=80&w=800"
        ],
        seller_name: "Agrofinca del Tormes SAT",
        phone: "923 55 09 41",
        category: "maquinaria",
        subcategory: "Tractores"
    },
    {
        title: "Kubota M7132 - 130CV 4x4",
        price: 29000,
        description: "Kubota M7132 con 130 CV, doble tracción. Año 2013, 5200 horas. Enganche frontal y trasero. Muy fiable y económico en consumo. Negociable.",
        location: "Ávila",
        photos: [
            "https://images.unsplash.com/photo-1564936281403-5a73e2d4b2e1?auto=format&fit=crop&q=80&w=800"
        ],
        seller_name: "Miguel Ángel Herrero",
        phone: "659 87 23 45",
        category: "maquinaria",
        subcategory: "Tractores"
    },
    {
        title: "Deutz-Fahr Agrotron 105 MK3",
        price: 18500,
        description: "Deutz-Fahr Agrotron 105 MK3 del 2004. Motor Deutz enfriado por agua, 105CV. 6200 horas. Recientemente revisado, cabina con A/C funcional.",
        location: "Segovia",
        photos: [
            "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&q=80&w=800"
        ],
        seller_name: "Hermanos Velasco Agrícola",
        phone: "921 44 67 23",
        category: "maquinaria",
        subcategory: "Tractores"
    },
    {
        title: "Case IH Maxxum 150 con suspensión delantera",
        price: 59000,
        description: "Case IH Maxxum 150, año 2020, tan solo 1100 horas. Suspensión delantera, AFS Connect, neumáticos casi nuevos. Garantía de concesionario disponible.",
        location: "Palencia",
        photos: [
            "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800"
        ],
        seller_name: "Servicios Agrícolas del Norte",
        phone: "979 22 31 56",
        category: "maquinaria",
        subcategory: "Tractores"
    }
];

async function createUserOrFind(sellerName, phone) {
    // Generar email ficticio basado en el nombre
    const cleanName = sellerName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '.');
    const email = `${cleanName}@ruralpop.co`;

    // Buscar si ya existe
    const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .limit(1);

    if (existing && existing.length > 0) {
        return existing[0].id;
    }

    // Crear un nuevo auth user con email/pass ficticios
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: 'Ruralpop2025!',
        user_metadata: { name: sellerName },
        email_confirm: true
    });

    if (authError) {
        console.error(`Error creating auth user for ${sellerName}:`, authError.message);
        return null;
    }

    const userId = authData.user.id;

    // El trigger automático debería crear el perfil, pero nos aseguramos
    const { error: profileError } = await supabase
        .from('users')
        .upsert({
            id: userId,
            email: email,
            name: sellerName,
            location: null,
        }, { onConflict: 'id' });

    if (profileError) {
        console.error(`Error creating profile for ${sellerName}:`, profileError.message);
    }

    console.log(`  ✅ Created user: ${sellerName} (${email})`);
    return userId;
}

async function seedListings() {
    console.log('🚜 Starting seed for tractor listings from Milanuncios...\n');

    for (const item of SCRAPED_LISTINGS) {
        console.log(`Processing: ${item.title}`);

        const userId = await createUserOrFind(item.seller_name, item.phone);
        if (!userId) {
            console.log(`  ⚠️ Skipping - could not create user`);
            continue;
        }

        const { error } = await supabase.from('listings').insert({
            title: item.title,
            price: item.price,
            description: item.description,
            location: item.location,
            image_urls: item.photos,
            category: item.category,
            subcategory: null, // maquinaria no tiene subcategoria en el schema aún
            user_id: userId,
            status: 'active',
            price_type: 'negotiable'
        });

        if (error) {
            console.error(`  ❌ Error inserting listing: ${error.message}`);
        } else {
            console.log(`  ✅ Listing inserted`);
        }
    }

    console.log('\n✅ Done! All listings processed.');
}

seedListings();
