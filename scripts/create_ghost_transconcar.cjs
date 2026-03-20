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
    name: 'Transconcar',
    email: 'info@transconcar.es', // Public email
    adminEmail: 'jcgonzalez@transconcar.es', // Private/Admin email
    logo: 'https://www.transconcar.es/resources/cache/l/o/g/9934fb481b7a21cbf54a3de54e581e77-logo_c.webp',
    description: 'Nuestra actividad se basa principalmente en el transporte regular de vehículos y maquinaria agrícola a través de todo el territorio nacional y portugués y, esporádicamente, movimiento de mercancías por Europa. Asimismo, también ofrecemos soluciones logísticas integrales que abarcan desde la recepción de mercancías, el almacenamiento y clasificación de la misma, hasta la distribución a través de nuestro servicio propio de transporte.\n\nEmails de contacto privado: info@transconcar.es, jcgonzalez@transconcar.es',
    address: 'Calle Ricardo Tormo, 18. 28914, Leganés. Madrid.',
    phone: '606 327 171',
    products: [
        {
            title: 'Transporte de tractores',
            url: 'https://www.transconcar.es/resources/cache/4/1/8/9850a6fba200b6a0b1f7298b95ac4726-418ba6b96ebe49635e25b2c627965a3d36f2442c.webp'
        },
        {
            title: 'Transporte maquinaria agrícola',
            url: 'https://www.transconcar.es/resources/cache/b/2/f/bef9b23e66b3f6f8b5d741649c36509d-b2fd7cc9271ece909c2d6abe32dbd38308ed741c.webp'
        },
        {
            title: 'Servicio integral logística',
            url: 'https://www.transconcar.es/resources/contenidos/11cb1f358b1eabff1920adb86b8dce2f27219bda.jpg'
        },
        {
            title: 'Servicio de almacenamiento de mercancías',
            url: 'https://www.transconcar.es/resources/cache/5/7/5/24ba5ae2df0d53295f0293fa055c50bd-575ef047edd0d18037dbb32c4a7c8f6db24b7b54-th.webp'
        }
    ]
};

async function createGhostProfile() {
    console.log(`Starting ghost creation for ${COMPANY_INFO.name}...`);
    
    // We will use adminEmail as the primary user email so it gets the demo emails
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
    
    console.log("Updating public.users data...");
    const { error: updateError } = await supabase.from('users').update({
        commercial_name: COMPANY_INFO.name,
        name: COMPANY_INFO.name,
        company_description: COMPANY_INFO.description,
        company_address: COMPANY_INFO.address,
        location: COMPANY_INFO.address,
        contact_phone: COMPANY_INFO.phone,
        is_ghost: true,
        role: 'profesional',
        ghost_token: ghostToken,
        avatar_url: COMPANY_INFO.logo,
        company_logo_url: COMPANY_INFO.logo
    }).eq('id', userId);

    if (updateError) {
        console.error("Error updating public.users:", updateError);
        return;
    }
    console.log("User updated perfectly!");

    console.log("Creating ghost products...");
    for (const prod of COMPANY_INFO.products) {
        console.log(`Creating product: ${prod.title}`);
        
        // Let's download the image and upload it to Supabase so it's optimized and served right
        const storagePath = `${userId}/${crypto.randomUUID()}/photo.png`;
        let publicUrl = prod.url;

        try {
            console.log(`Downloading ${prod.url}`);
            const res = await fetch(prod.url);
            const arrayBuffer = await res.arrayBuffer();
            
            const uploadRes = await supabase.storage.from('listings').upload(storagePath, arrayBuffer, {
                contentType: 'image/webp',
                upsert: true
            });
            
            if (uploadRes.error) {
                console.error("Storage upload failed:", uploadRes.error);
            } else {
                const { data: pubData } = supabase.storage.from('listings').getPublicUrl(storagePath);
                publicUrl = pubData.publicUrl;
                console.log(`Uploaded to Supabase Storage: ${publicUrl}`);
            }
        } catch (e) {
            console.error("Error fetching/uploading image:", e.message);
        }

        const listingData = {
            user_id: userId,
            title: prod.title,
            description: `Servicio oficial de ${prod.title} ofrecido por ${COMPANY_INFO.name}. Contacte para más información.`,
            price: 0,
            price_type: 'negotiable',
            category: 'otros',
            subcategory: 'servicios',
            location: 'Nacional',
            status: 'sold', // MUST be sold for ghosts!
            image_urls: [publicUrl],
            is_featured: true, // make them look good
        };

        const { error: insertError } = await supabase.from('listings').insert([listingData]);
        if (insertError) {
            console.error(`Error inserting listing ${prod.title}:`, insertError);
        } else {
            console.log(`Listing ${prod.title} added successfully.`);
        }
    }

    console.log("--- SUCCESS ---");
    console.log(`Transconcar Ghost Profile created!`);
    console.log(`Link: /empresa/transconcar-${userId.substring(0,8)}?is_ghost_profile=true`);
}

createGhostProfile();
