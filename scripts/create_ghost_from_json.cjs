const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function downloadAndOptimizeImage(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const optimizedBuffer = await sharp(buffer)
            .resize(1000, 1000, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .jpeg({ quality: 60, progressive: true, mozjpeg: true })
            .toBuffer();

        return optimizedBuffer;
    } catch (e) {
        console.error(`Failed to download/optimize image: ${url}`, e);
        return null;
    }
}

async function run() {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error("Please provide a path to a JSON file");
        process.exit(1);
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawData);

    const companyData = data.company;
    const products = data.products;

    console.log(`\n==========================================`);
    console.log(`🚀 IMPORTING GHOST PROFILE: ${companyData.commercial_name}`);
    console.log(`==========================================\n`);

    // 1. Generate Fake Auth
    const ghostEmail = `${companyData.commercial_name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}_ghost@ruralpop.com`;
    const fakePassword = crypto.randomUUID() + "A1!";
    
    // Create new auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: ghostEmail,
        password: fakePassword,
        email_confirm: true,
    });

    if (authError) {
        console.error("Auth User creation error:", authError);
        return;
    }

    const userId = authData.user.id;
    console.log(`✅ Created Auth User: ${userId} (${ghostEmail})`);

    // 2. Upload Logo
    let finalLogoUrl = null;
    if (companyData.company_logo_url) {
        console.log(`Downloading logo from ${companyData.company_logo_url}...`);
        try {
            const logoRes = await fetch(companyData.company_logo_url);
            const logoBuffer = Buffer.from(await logoRes.arrayBuffer());
            const optLogo = await sharp(logoBuffer)
                .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
                .png({ quality: 80 })
                .toBuffer();
                
            const logoStoragePath = `${userId}/logo_${Date.now()}.png`;
            await supabase.storage.from('users').upload(logoStoragePath, optLogo, { contentType: 'image/png', upsert: true });
            const { data: logoPubData } = supabase.storage.from('users').getPublicUrl(logoStoragePath);
            finalLogoUrl = logoPubData.publicUrl;
            console.log(`✅ Uploaded Logo: ${finalLogoUrl}`);
        } catch (e) {
            console.error("Failed to upload logo:", e);
        }
    }

    // 3. Update ghost profile record in users table
    const ghostToken = crypto.randomUUID();
    const { error: userUpdateError } = await supabase.from('users').update({
        role: 'profesional',
        commercial_name: companyData.commercial_name,
        company_description: companyData.description,
        avatar_url: finalLogoUrl,
        company_logo_url: finalLogoUrl,
        location: companyData.location,
        contact_phone: companyData.phone,
        company_website: companyData.website,
        is_ghost: true,
        ghost_token: ghostToken
    }).eq('id', userId);

    if (userUpdateError) {
        console.error("User profile update error:", userUpdateError);
        return;
    }
    console.log(`✅ Ghost profile updated in users table.`);

    // 4. Create products
    console.log(`\n⏳ Processing ${products.length} products...`);
    for (let i = 0; i < products.length; i++) {
        const prod = products[i];
        console.log(`   [${i+1}/${products.length}] ${prod.title}`);

        const listingData = {
            user_id: userId,
            title: prod.title,
            description: `Interesado en ${prod.title}? Contáctanos directamente a través de nuestro sitio web para más información.`,
            price: 0,
            price_type: 'negotiable',
            category: prod.category || 'otros',
            subcategory: 'piezas',
            location: companyData.location,
            status: 'sold', // Prevents ruralpop checkout/chat logic
            image_urls: [], 
            is_featured: true, 
        };

        const { data: newListingParams, error: insertError } = await supabase.from('listings').insert([listingData]).select('id').single();
        if (insertError) {
            console.error(`     ❌ Error inserting listing:`, insertError);
            continue;
        } 
        
        const listingId = newListingParams.id;

        if (prod.external_image_url) {
            const optImg = await downloadAndOptimizeImage(prod.external_image_url);
            if (optImg) {
                const storagePath = `${userId}/${listingId}/photo_${Date.now()}.jpg`; 
                const { error: uploadError } = await supabase.storage.from('listings').upload(storagePath, optImg, { 
                    contentType: 'image/jpeg', 
                    upsert: true 
                });
                
                if (!uploadError) {
                    const { data: pubData } = supabase.storage.from('listings').getPublicUrl(storagePath);
                    await supabase.from('listings').update({ image_urls: [pubData.publicUrl] }).eq('id', listingId);
                    console.log(`     ✅ Image uploaded and listing updated`);
                } else {
                    console.error(`     ❌ Error uploading image:`, uploadError);
                }
            }
        }
    }

    console.log(`\n🎉 FINISHED PLUMED PROCESSING!`);
}

run();
