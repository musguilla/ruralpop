
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedData() {
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

    if (userError || !users || users.length === 0) {
        console.error('No users found:', userError);
        return;
    }

    const userId = users[0].id;
    console.log(`Using User ID: ${userId}`);

    const listingsToInsert = [
        {
            "title": "Vaca Frisona de Leche",
            "price": 1450,
            "location": "Lugo",
            "image_urls": ["https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800"],
            "description": "Vaca frisona joven, segunda parición. Muy mansa y buena producción lechera. Todas las vacunas al día.",
            "category": "animales",
            "subcategory": "Bovino",
            "user_id": userId,
            "status": "active"
        },
        {
            "title": "Novilla Rubia Gallega",
            "price": 1200,
            "location": "Ourense",
            "image_urls": ["https://images.unsplash.com/photo-1527153351930-4b2bd313f080?auto=format&fit=crop&q=80&w=800"],
            "description": "Novilla de pura raza rubia gallega. 18 meses. Excelente genética para cría.",
            "category": "animales",
            "subcategory": "Bovino",
            "user_id": userId,
            "status": "active"
        },
        {
            "title": "Pareja de Bueyes de Trabajo",
            "price": 4500,
            "location": "Asturias",
            "image_urls": ["https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&q=80&w=800"],
            "description": "Pareja de bueyes herrados y enseñados a trabajar. Muy nobles. Se venden por jubilación.",
            "category": "animales",
            "subcategory": "Bovino",
            "user_id": userId,
            "status": "active"
        },
        {
            "title": "Terneros para Cebo",
            "price": 450,
            "location": "Salamanca",
            "image_urls": ["https://images.unsplash.com/photo-1545468843-27956f307ed8?auto=format&fit=crop&q=80&w=800"],
            "description": "Lote de 5 terneros cruzados para cebadero. 200kg de media. Saneados.",
            "category": "animales",
            "subcategory": "Bovino",
            "user_id": userId,
            "status": "active"
        },
        {
            "title": "Vaca Asturiana de los Valles",
            "price": 1600,
            "location": "Cangas de Onís",
            "image_urls": ["https://images.unsplash.com/photo-1551334787-21e6bd3ab135?auto=format&fit=crop&q=80&w=800"],
            "description": "Vaca Asturiana de los Valles certificada. Preñada de 5 meses. Muy bien cuidada.",
            "category": "animales",
            "subcategory": "Bovino",
            "user_id": userId,
            "status": "active"
        }
    ];

    const { data, error } = await supabase
        .from('listings')
        .insert(listingsToInsert);

    if (error) {
        console.error('Error inserting:', error);
    } else {
        console.log('Successfully inserted 5 Bovine listings');
    }
}

seedData();
