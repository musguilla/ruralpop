const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const COMPANY_INFO = {
    name: 'DOMAG',
    commercial_name: 'DOMAG',
    email: 'info@domag.es',
    adminEmail: 'info@domag.es',
    logo: 'https://secureservercdn.net/160.153.138.143/r65.b38.myftpupload.com/wp-content/uploads/2020/06/DOMAG-PNG_-3.png',
    description: 'DOMAG es una marca de empresa reconocida y valorada en España y Portugal, en los sectores de maquinaria agrícola, forestal, infraestructura y construcción. Cuenta con un equipo de expertos profesionales de alto nivel.\nFue creada por Doménico Maggi en 1975 para la importación y distribución en España y Portugal de esta maquinaria. Generando confianza, creando soluciones.',
    address: 'España',
    phone: '',
    website: 'https://domag.es/',
    products: [
        { title: 'Vibrador autopropulsado SICMA SPEEDY 90', description: 'Vibrador autopropulsado modelo SICMA SPEEDY 90 ideal para la recolección de almendras o aceitunas en terrenos diversos.', imageUrl: null },
        { title: 'Vibrador autopropulsado SICMA F3 125', description: 'Potente vibrador autopropulsado de la serie F3 (125) diseñado con alta fiabilidad, durabilidad y precisión.', imageUrl: null },
        { title: 'Mini cargador con pinza vibrante SICMA Mini Agri 4x4', description: 'Mini cargador compacto con brazo telescópico y tracción 4x4, equipado con pinza vibrante integral de alta sujeción.', imageUrl: null },
        { title: 'Vibrador arrastrado SICMA TR80', description: 'Vibrador tipo arrastrado (SICMA TR80), una opción robusta para enganche proporcionando excelentes niveles de rendimiento.', imageUrl: null },
        { title: 'Vibrador autopropulsado ANDREOLI ATHENA', description: 'La ATHENA es una máquina autopropulsada altamente eficiente para recolección mecanizada optimizada.', imageUrl: null },
    ]
};

async function createGhostProfile() {
    console.log(`Starting ghost creation for ${COMPANY_INFO.name}...`);
    
    let userId;
    const { data: existingUser } = await supabase.from('users').select('id, email').eq('email', COMPANY_INFO.adminEmail).single();

    if (existingUser) {
        console.log(`User already exists with ID: ${existingUser.id}`);
        userId = existingUser.id;
    } else {
        const fakePassword = crypto.randomBytes(12).toString('hex') + 'A1!';
        console.log(`Creating Auth user with email ${COMPANY_INFO.adminEmail}...`);
        
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: COMPANY_INFO.adminEmail,
            password: fakePassword,
            email_confirm: true,
            user_metadata: {
                full_name: COMPANY_INFO.name,
                is_ghost: true
            }
        });

        if (authError) {
            console.error("Error creating Auth user:", authError);
            return;
        }
        
        userId = authData.user.id;
        console.log(`Auth user created successfully: ${userId}`);
        console.log("Waiting 2 seconds for public.users trigger...");
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const ghostToken = crypto.randomUUID();
    
    // Upload Logo
    let uploadedLogoUrl = COMPANY_INFO.logo;
    try {
        console.log(`Downloading logo: ${COMPANY_INFO.logo}`);
        const res = await fetch(COMPANY_INFO.logo);
        const arrayBuffer = await res.arrayBuffer();
        
        const storagePath = `${userId}/logo_domag.png`;
        const { error: uploadError } = await supabase.storage.from('users').upload(storagePath, arrayBuffer, {
            contentType: 'image/png',
            upsert: true
        });
        
        if (!uploadError) {
            const { data: pubData } = supabase.storage.from('users').getPublicUrl(storagePath);
            uploadedLogoUrl = pubData.publicUrl;
            console.log(`Uploaded logo to absolute host: ${uploadedLogoUrl}`);
        }
    } catch(e) {
        console.error("Failed to host logo, keeping raw url.", e.message);
    }
    
    console.log("Updating public.users data...");
    const { error: updateError } = await supabase.from('users').update({
        commercial_name: COMPANY_INFO.commercial_name,
        name: COMPANY_INFO.name,
        company_description: COMPANY_INFO.description,
        company_address: COMPANY_INFO.address,
        location: COMPANY_INFO.address,
        contact_phone: COMPANY_INFO.phone,
        company_website: COMPANY_INFO.website,
        is_ghost: true,
        role: 'profesional',
        ghost_token: ghostToken,
        avatar_url: uploadedLogoUrl,
        company_logo_url: uploadedLogoUrl
    }).eq('id', userId);

    if (updateError) {
        console.error("Error updating public.users:", updateError);
        return;
    }
    console.log("User updated perfectly!");

    console.log("Wiping existing dummy listings if any...");
    await supabase.from('listings').delete().eq('user_id', userId);

    console.log("Creating ghost products...");
    for (const prod of COMPANY_INFO.products) {
        const listingData = {
            user_id: userId,
            title: prod.title,
            description: `${prod.description} - Un producto certificado de ${COMPANY_INFO.name}.`,
            price: 0,
            price_type: 'negotiable',
            category: 'cosechadoras', 
            subcategory: 'piezas',
            location: 'Nacional',
            status: 'sold', 
            image_urls: [], 
            is_featured: true, 
        };

        const { error: insertError } = await supabase.from('listings').insert([listingData]);
        if (insertError) {
            console.error(`Error inserting listing ${prod.title}:`, insertError);
        } else {
            console.log(`Listing ${prod.title} added successfully.`);
        }
    }

    console.log("--- SUCCESS ---");
    console.log(`Domag Ghost Profile created!`);
    console.log(`Link: /empresa/${COMPANY_INFO.commercial_name.toLowerCase()}?is_ghost_profile=true`);
}

createGhostProfile();
