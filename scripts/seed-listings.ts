
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase env variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedData() {
    // 1. Get a user
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

    if (userError || !users || users.length === 0) {
        console.error('No users found to assign listings to');
        return;
    }

    const userId = users[0].id;
    console.log(`Using User ID: ${userId}`);

    const listingsToInsert = [
        {
            "title": "Tractor Pasquali 18cv",
            "price": 2900,
            "location": "Oviedo",
            "image_urls": ["https://cdn.wallapop.com/images/10420/kd/z8/__/c10420p1232802431/i6307063240.jpg?pictureSize=W640"],
            "description": "tractor pasquali 18cv matriculado con documentacion se puede transferir unico dueño siempre en la familia en perfectisimo estado, pintura de la casa apenas usado y en tal caso uso muy muy esporadico. Caja nueva con basculante. Incorpora laterales altos. Esta perfecto de todo ni una sola cosa para hacerle ruedas nuevas mantenimiento nuevo etc etc...Mas informacion por chat. Mejor ver en persona y probar",
            "category": "animales",
            "subcategory": "Bovino",
            "user_id": userId,
            "status": "active"
        },
        {
            "title": "Tractor Same Explorer II 90",
            "price": 23000,
            "location": "Gijón",
            "image_urls": ["https://cdn.wallapop.com/images/10420/k7/pf/__/c10420p1222266733/i6237306013.jpg?pictureSize=W640"],
            "description": "Manual de taller del tractor Same Explorer II 90. Formato pdf. En perfecto estado de conservación.",
            "category": "animales",
            "subcategory": "Bovino",
            "user_id": userId,
            "status": "active"
        },
        {
            "title": "Barredora Hidráulica Tractor",
            "price": 2500,
            "location": "Gijón",
            "image_urls": ["https://cdn.wallapop.com/images/10420/k7/43/__/c10420p1221271796/i6231437892.jpg?pictureSize=W640"],
            "description": "Se vende Barredora para tractor de 1,5 mt. de ancho, funcionamiento hidráulico. Está muy poco usada.",
            "category": "animales",
            "subcategory": "Bovino",
            "user_id": userId,
            "status": "active"
        },
        {
            "title": "Tractocarro con volquete verde",
            "price": 3900,
            "location": "Gijón",
            "image_urls": ["https://cdn.wallapop.com/images/10420/ka/8h/__/c10420p1226515186/i6264921913.jpg?pictureSize=W640"],
            "description": "Tractocarro pascuali de 2 cilindros 21 cv arranque eléctrico con batería ruedas semi nuevas , caja con volquete hidráulico repasado de todo documentación al día , precio algo negociable",
            "category": "animales",
            "subcategory": "Bovino",
            "user_id": userId,
            "status": "active"
        },
        {
            "title": "Tractor cortacésped honda",
            "price": 1800,
            "location": "El Berron",
            "image_urls": ["https://cdn.wallapop.com/images/10420/ke/5k/__/c10420p1233098276/i6309590357.jpg?pictureSize=W640"],
            "description": "Se vende tractor cortacésped honda de 2 pistones idroestatico motor honda de 17cv en buen estao 1800€",
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
        console.error('Error inserting listings:', error);
    } else {
        console.log('Successfully inserted listings');
    }
}

seedData();
