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
    name: 'Agrosalamanca',
    commercial_name: 'Agrosalamanca',
    email: 'info@agrosalamanca.es',
    adminEmail: 'info@agrosalamanca.es',
    logo: 'https://agrosalamanca.es/assets/images/logo/logo.png',
    description: 'Concesionario Oficial New Holland Salamanca y sur de Zamora. AGROSALAMANCA surge fruto de la unión de dos empresas con una dilatada y prestigiosa trayectoria en el sector agropecuario: FHASA Y AGROSALAMANCA. El objetivo es ofrecer un servicio único aunando lo mejor de ambas, es decir, muchos años de experiencia, criterio profesional y excelente atención al cliente. Un servicio completo cuyo fin es satisfacer la demanda de los agricultores y ganaderos.',
    address: 'C/ Zeppelin. Nº12. P.I. "El Montalvo I" 37188 Carbajosa de la Sagrada (Salamanca) España',
    phone: '92 324 12 11',
    website: 'https://agrosalamanca.es/',
    products: [
        { title: 'Tractores New Holland', description: 'Toda la gama de tractores New Holland. Disponibles para la agricultura moderna y de precisión.', imageUrl: null },
        { title: 'Empacadoras y Cosechadoras', description: 'Venta de Cosechadoras y la Nueva Empacadora New Holland BIGBALER. Sin límite de velocidad.', imageUrl: null },
        { title: 'Manipuladoras Telescópicas', description: 'Gama de manipuladoras telescópicas adaptadas para múltiples áreas y sectores ganaderos.', imageUrl: null },
        { title: 'Servicio de Taller y Postventa', description: 'Recambios, almacén con amplio surtido y talleres móviles para resolver in situ las averías 24/7.', imageUrl: null },
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
    
    // Upload Logo to our bucket to ensure it never expires
    let uploadedLogoUrl = COMPANY_INFO.logo;
    try {
        console.log(`Downloading logo: ${COMPANY_INFO.logo}`);
        const res = await fetch(COMPANY_INFO.logo);
        const arrayBuffer = await res.arrayBuffer();
        
        const storagePath = `${userId}/logo_agrosalamanca.png`;
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

    console.log("Creating ghost products...");
    for (const prod of COMPANY_INFO.products) {
        // delete any duplicates first if we are just re-running script? skip for now
        
        const listingData = {
            user_id: userId,
            title: prod.title,
            description: `${prod.description} - Ofertado por ${COMPANY_INFO.name}.`,
            price: 0,
            price_type: 'negotiable',
            category: 'tractores',
            subcategory: 'servicios',
            location: 'Nacional',
            status: 'sold', // MUST be sold for ghosts!
            image_urls: [], // Left empty for user uploading later
            is_featured: true, 
        };

        const { error: insertError } = await supabase.from('listings').insert([listingData]);
        if (insertError) {
            console.error(`Error inserting listing ${prod.title}:`, insertError);
        } else {
            console.log(`Listing ${prod.title} added successfully with no initial image.`);
        }
    }

    console.log("--- SUCCESS ---");
    console.log(`Agrosalamanca Ghost Profile created!`);
    console.log(`Link: /empresa/${COMPANY_INFO.commercial_name.toLowerCase()}?is_ghost_profile=true`);
}

createGhostProfile();
