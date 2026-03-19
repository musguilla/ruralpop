import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const COMPANY_NAME = 'De Heus';
const COMPANY_LOGO = 'https://www.deheus.es/globalassets/about-de-heus/our-brands/de-heus-animal-nutrition-logo.jpg?format=webp&mode=crop&height=150';
const COMPANY_DESC = 'En De Heus Nutrición Animal nos dedicamos cada día a brindar a nuestros clientes las mejores soluciones nutricionales posibles, independientemente del tipo de productos que requieran o de cuáles sean sus necesidades.';

const CONTACT_EMAIL = 'info.es@deheus.com';
const CONTACT_PHONE = '+34 910015941';
const ADDRESS = 'Plaza de Mina 1, 4º derecha';
const CITY = 'A Coruña';
const ZIP = '15004';
const COUNTRY = 'España';

const PRODUCT_URLS = [
    'https://www.deheus.es/productos-y-servicios/productos-rumiantes/kovital-iniciacion',
    'https://www.deheus.es/productos-y-servicios/productos-rumiantes/kovital-arranque',
    'https://www.deheus.es/productos-y-servicios/productos-rumiantes/kovital-cebo',
    'https://www.deheus.es/productos-y-servicios/productos-rumiantes/kovital-acabado',
    'https://www.deheus.es/productos-y-servicios/productos-rumiantes/reprobeef-super',
    'https://www.deheus.es/productos-y-servicios/productos-rumiantes/reprobeef-proteico',
    'https://www.deheus.es/productos-y-servicios/productos-rumiantes/bacilactol-benefit',
    'https://www.deheus.es/productos-y-servicios/productos-rumiantes/bacilactol-absolut',
    'https://www.deheus.es/productos-y-servicios/productos-caballos/equifeed-breeding',
    'https://www.deheus.es/productos-y-servicios/productos-caballos/equifeed-essence',
    'https://www.deheus.es/productos-y-servicios/productos-caballos/equifeed-exclusive-omega-3',
    'https://www.deheus.es/productos-y-servicios/productos-caballos/equifeed-supreme-e',
    'https://www.deheus.es/productos-y-servicios/productos-caballos/equifeed-balance-cc',
    'https://www.deheus.es/productos-y-servicios/productos-caballos/equifeed-blend-muesli',
    'https://www.deheus.es/productos-y-servicios/productos-caballos/equiblock-10',
    'https://www.deheus.es/productos-y-servicios/productos-avicultura/one-recria-201',
    'https://www.deheus.es/productos-y-servicios/productos-avicultura/one-prepuesta',
    'https://www.deheus.es/productos-y-servicios/productos-avicultura/one-puesta-f3',
    'https://www.deheus.es/productos-y-servicios/productos-avicultura/one-puesta-f2',
    'https://www.deheus.es/productos-y-servicios/productos-avicultura/one-sp-protect',
    'https://www.deheus.es/productos-y-servicios/productos-avicultura/one-sp-prepico'
];

async function run() {
    console.log(`🚀 Generando perfil fantasma para ${COMPANY_NAME}...`);

    // 1. Check if user already exists
    const { data: existingGhost } = await supabase
        .from('users')
        .select('id')
        .eq('commercial_name', COMPANY_NAME)
        .eq('is_ghost', true)
        .single();
    
    let userId;

    if (existingGhost) {
        console.log(`⚠️ Perfil fantasma ya existe. Actualizando datos...`);
        userId = existingGhost.id;
    } else {
        const fakeEmail = 'ghost_deheus___' + crypto.randomUUID().slice(0, 5) + '@ruralpop.com';
        const ghostToken = crypto.randomUUID();

        // Must create auth user first
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: fakeEmail,
            password: crypto.randomUUID(),
            email_confirm: true,
        });

        if (authError || !authUser.user) {
            console.error("❌ Error creando Auth user:", authError);
            process.exit(1);
        }
        
        const newId = authUser.user.id;
        
        // Let the trigger run, then update the row
        // Wait a tiny bit just in case trigger is async
        await new Promise(r => setTimeout(r, 1000));

        const { error } = await supabase
            .from('users')
            .update({
                name: 'Equipo De Heus',
                role: 'profesional',
                commercial_name: COMPANY_NAME,
                company_description: COMPANY_DESC,
                company_address: ADDRESS,
                company_zip: ZIP,
                company_country: COUNTRY,
                contact_phone: CONTACT_PHONE,
                company_logo_url: COMPANY_LOGO,
                avatar_url: COMPANY_LOGO,
                plan_type: 'start', // Fake plan
                is_ghost: true,
                ghost_token: ghostToken
            })
            .eq('id', newId);

        if (error) {
            console.error("❌ Error creando usuario:", error);
            process.exit(1);
        }
        userId = newId;
        console.log(`✅ Perfil fantasma creado exitosamente. ID: ${userId}`);
        console.log(`➡️  Enlace Mágico: /empresa/de-heus?token=${ghostToken}`);
    }

    // 2. Scrape & Add items
    for (const url of PRODUCT_URLS) {
        try {
            console.log(`[ ] Procesando: ${url}`);
            const response = await fetch(url);
            const html = await response.text();
            const $ = cheerio.load(html);

            let title = $('h1').first().text().trim();
            if (!title) {
                 title = $('meta[property="og:title"]').attr('content') || '';
            }

            let description = $('meta[property="og:description"]').attr('content') || '';
            if (!description) {
                // Try grabbing the first paragraph under h1
                description = $('h1').first().next('p').text().trim();
            }

            let imageUrl = $('meta[property="og:image"]').attr('content');
            if (!imageUrl) {
                // Try finding first img inside main content
                const firstImg = $('main img').first().attr('src');
                if (firstImg) {
                    imageUrl = firstImg.startsWith('http') ? firstImg : `https://www.deheus.es${firstImg}`;
                } else {
                    imageUrl = COMPANY_LOGO; // Fallback
                }
            }

            let category = 'Vacas';
            if (url.includes('caballos')) category = 'Caballos';
            if (url.includes('avicultura')) category = 'Gallinas';
            const subcategory = 'Alimentación';
            
            // Check if listing exists by title and user_id instead of slug
            const { data: existingListing } = await supabase
                .from('listings')
                .select('id, image_urls')
                .eq('user_id', userId)
                .eq('title', title)
                .single();

            let listingId;
            let currentImageUrls: string[] = [];

            if (existingListing) {
                console.log(`   🔸 Anuncio ${title} ya existe, actualizando...`);
                listingId = existingListing.id;
                currentImageUrls = existingListing.image_urls || [];
                await supabase.from('listings').update({
                    description,
                    category,
                    subcategory: null,
                    status: 'ghost' // Unique status so they stay hidden in feeds but direct links work
                }).eq('id', listingId);
            } else {
                const { data: inserted, error: insertError } = await supabase
                    .from('listings')
                    .insert({
                        user_id: userId,
                        title,
                        description,
                        category,
                        subcategory: null,
                        price: 0,
                        price_type: 'negotiable',
                        status: 'ghost', // Unique status for imported hidden items
                        location: CITY,
                        image_urls: []
                    })
                    .select('id')
                    .single();

                if (insertError) {
                    console.error(`   ❌ Error en DB: ${insertError.message}`);
                    continue;
                }
                listingId = inserted.id;
            }

            // Upload image if not already attached
            if (currentImageUrls.length === 0 && imageUrl) {
                console.log(`   📸 Descargando imagen...`);
                const imgRes = await fetch(imageUrl);
                const buffer = await imgRes.arrayBuffer();
                
                const ext = imageUrl.split('?')[0].split('.').pop() || 'jpg';
                const filename = `${userId}/${listingId}_0.${ext}`;
                
                const { error: uploadError } = await supabase
                    .storage
                    .from('listings')
                    .upload(filename, buffer, {
                        contentType: imgRes.headers.get('content-type') || 'image/jpeg',
                        upsert: true
                    });

                if (!uploadError) {
                    const { data: publicUrlData } = supabase.storage.from('listings').getPublicUrl(filename);
                    
                    // Update listings table with new image_urls array
                    await supabase.from('listings').update({
                        image_urls: [publicUrlData.publicUrl]
                    }).eq('id', listingId);
                    
                    console.log(`   ✅ Imagen añadida y actualizada en el anuncio`);
                } else {
                    console.warn(`   ⚠️ Status de subida imagen: ${uploadError.message}`);
                }
            } else {
                console.log(`   ✅ Listo (Ya tenía imágenes)`);
            }
        } catch (e: any) {
            console.error(`❌ Error general con ${url}:`, e.message);
        }
    }

    console.log("🎉 Terminado. Revisa Supabase.");
}

run();
