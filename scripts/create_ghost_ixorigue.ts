import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error("Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const COMPANY_INFO = {
    name: "Ixorigue",
    email: "info@ixorigue.com",
    address: "c/ Faraday 7 - Oficina 3.12, Parque Científico de Madrid, 28049 Madrid, España",
    description: "Controla tu ganadería desde el móvil. Ahorra costes de manejo y evita pérdidas de animales con el dispositivo que te permite saber el estado de tu ganadería estés donde estés. ¡Tu tranquilidad y el bienestar de tus animales son nuestra prioridad!\nRecibe alertas instantáneas en caso de riesgos, movimientos inusuales o incluso predicción de partos.",
    logoUrl: "https://scontent-mad1-1.cdninstagram.com/v/t51.2885-19/175900071_265888685220411_4070392547978914689_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-mad1-1.cdninstagram.com&_nc_cat=103&_nc_oc=Q6cZ2QEn165dMpQVwxNlGRtikvvjPzVpa1kSOiKOf1LLl7TrbILGbfpZzt1XPFmGUGQMH-w&_nc_ohc=JXJ_Klp57SMQ7kNvwHyVEF8&_nc_gid=fYCWp-Ju5cPFINaZ7ESYoA&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfwMolxDyzuGnBaJKnvaVcMvnVNJfvJb6WHVlhYB4iBudg&oe=69BE73A2&_nc_sid=8b3546"
};

const PRODUCTS = [
    {
        title: "Collares GPS Ixorigue",
        description: "Collar GPS inteligente diseñado específicamente para el monitoreo de ganado extensivo. Conectividad satelital y batería de larga duración. Podrás conocer la ubicación exacta de tus animales, crear zonas seguras (geofencing) y recibir alertas si salen del perímetro. Todo desde tu teléfono móvil.",
        category: "servicios",
        subcategory: "servicios-ganaderos",
        externalUrl: "https://ixorigue.com/es/collaresgps",
        imageFallback: "https://ixorigue.com/wp-content/uploads/2023/11/Collar-GPS-Ixorigue.jpg" // Fallback in case we need a direct URL
    },
    {
        title: "Cow Pro",
        description: "Cow Pro es el dispositivo definitivo para la trazabilidad y salud de tu ganado. Se coloca cómodamente en la oreja de la vaca como un crotal avanzado. Monitorea constantes vitales, actividad diaria, detección temprana de celo y predicción precisa de partos. Recibe todas las notificaciones preventivas y mejora la rentabilidad de tu explotación agrícola sin falsas alarmas.",
        category: "servicios",
        subcategory: "servicios-veterinarios",
        externalUrl: "https://cow.pro/",
        imageFallback: "https://ixorigue.com/wp-content/uploads/2023/11/Cow-Pro-Oreja.jpg"
    }
];

async function run() {
    console.log(`🚀 Generando perfil fantasma para ${COMPANY_INFO.name}...`);

    let userId: string;
    let avatarPublicUrl: string | null = null;

    // 1. Buscar si el usuario ya existe por email (porque la carga previa falló a medias)
    const { data: existingUsers, error: searchError } = await supabase
        .from('users')
        .select('id, ghost_token, avatar_url')
        .eq('email', COMPANY_INFO.email)
        .limit(1);

    if (searchError) throw searchError;

    if (existingUsers && existingUsers.length > 0) {
        console.log(`⚠️ Perfil fantasma ya existe. Actualizando datos de perfil...`);
        userId = existingUsers[0].id;
        avatarPublicUrl = existingUsers[0].avatar_url;
        
        await supabase.from('users').update({
            company_description: COMPANY_INFO.description,
            company_address: COMPANY_INFO.address,
        }).eq('id', userId);

    } else {
        console.log(`✨ Creando nuevo usuario Auth (Auth Identity)...`);
        userId = uuidv4();
        const fakePassword = crypto.randomBytes(16).toString('hex');
        
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: COMPANY_INFO.email,
            password: fakePassword,
            email_confirm: true,
            user_metadata: {
                full_name: COMPANY_INFO.name,
                is_ghost: true
            }
        });

        if (authError) {
            console.error(`❌ Error creando usuario en Auth: ${authError.message}`);
            return;
        }

        userId = authData.user.id;
        const ghostToken = crypto.randomUUID();

        // Wait for the Supabase trigger to finish creating the row
        let triggerFinished = false;
        for (let i = 0; i < 20; i++) {
            const { data } = await supabase.from('users').select('id').eq('id', userId).single();
            if (data) {
                triggerFinished = true;
                break;
            }
            await new Promise(r => setTimeout(r, 500));
        }

        if (!triggerFinished) {
            console.error("❌ Timeout: El trigger de Supabase no creó el usuario a tiempo.");
            process.exit(1);
        }

        console.log(`✨ Actualizando perfil profesional en tabla users...`);
        const { error: profileError } = await supabase.from('users').update({
            name: COMPANY_INFO.name,
            commercial_name: COMPANY_INFO.name,
            role: 'profesional',
            plan_type: 'start',
            company_description: COMPANY_INFO.description,
            company_address: COMPANY_INFO.address,
            is_ghost: true,
            ghost_token: ghostToken
        }).eq('id', userId);

        if (profileError) {
            console.error(`❌ Error creando perfil en public.users: ${profileError.message}`);
            return;
        }
        
        console.log(`🔐 GHOST TOKEN: ${ghostToken}`);
        console.log(`🔗 Link Escaparate: https://www.ruralpop.com/empresa/ixorigue?token=${ghostToken}`);
    }

    // 2. Subir o referenciar Logo
    if (!avatarPublicUrl && COMPANY_INFO.logoUrl) {
        console.log(`   📸 Asignando logotipo externo directamente...`);
        avatarPublicUrl = COMPANY_INFO.logoUrl;
        await supabase.from('users').update({ avatar_url: avatarPublicUrl, company_logo_url: avatarPublicUrl }).eq('id', userId);
        console.log(`   ✅ Logo enlazado correctamente.`);
    }

    // 3. Crear productos
    for (const product of PRODUCTS) {
        console.log(`\n📦 Procesando producto: ${product.title}`);
        
        let listingId;
        
        const { data: existingListing } = await supabase
            .from('listings')
            .select('id, image_urls')
            .eq('user_id', userId)
            .eq('title', product.title)
            .single();

        if (existingListing) {
            console.log(`   🔸 Anuncio ya existe, actualizando...`);
            listingId = existingListing.id;
            await supabase.from('listings').update({
                description: product.description,
                category: product.category,
                subcategory: product.subcategory,
                status: 'sold'
            }).eq('id', listingId);
        } else {
            const { data: inserted, error: insertError } = await supabase
                .from('listings')
                .insert({
                    user_id: userId,
                    title: product.title,
                    description: product.description,
                    category: product.category,
                    subcategory: product.subcategory,
                    price: 0,
                    price_type: 'a_convenir',
                    status: 'sold',
                    location: 'Toda España',
                    image_urls: [product.imageFallback] // Temporal until we upload a real one if needed
                })
                .select('id')
                .single();

            if (insertError) {
                console.error(`   ❌ Error en DB: ${insertError.message}`);
                continue;
            }
            listingId = inserted.id;
            console.log(`   ✅ Anuncio creado.`);
        }
    }

    console.log("\n🎉 Terminado. Revisa Supabase.");
}

run();
