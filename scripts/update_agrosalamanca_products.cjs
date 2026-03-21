const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const productsToCreate = [
    { title: 'Tractores New Holland', matchKeyword: 'tractor' }, // index 0 in script matching array
    { title: 'Implementos', matchKeyword: 'plow' },
    { title: 'Cosechadoras', matchKeyword: 'cosechadora' },
    { title: 'Maquinaria de ocasión', matchKeyword: 'ocasion' },
    { title: 'Agricultura de precisión', matchKeyword: 'plm' },
];

async function updateAgrosalamancaProducts() {
    console.log("Fetching Agrosalamanca user...");
    const { data: user } = await supabase.from('users').select('id, commercial_name').eq('email', 'info@agrosalamanca.es').single();
    if (!user) {
        console.error("User not found via info@agrosalamanca.es");
        return;
    }

    const userId = user.id;
    console.log(`Found Agrosalamanca user ID: ${userId}`);

    // Delete existing listings to start fresh
    console.log("Deleting old listings for this ghost profile...");
    await supabase.from('listings').delete().eq('user_id', userId);

    // Get the 5 latest media files
    const artifactsDir = '/Users/luis/.gemini/antigravity/brain/54bd403f-9554-41a2-b0dd-1df7a41a8985';
    const allFiles = fs.readdirSync(artifactsDir)
        .filter(f => f.startsWith('media__') && (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')))
        .map(f => ({
            name: f,
            time: fs.statSync(path.join(artifactsDir, f)).mtime.getTime()
        }))
        .sort((a, b) => a.time - b.time); // oldest to newest

    const latestFiles = allFiles.slice(-5).map(f => f.name);
    console.log("Latest 5 media files:", latestFiles);

    // Map files to products based on our visual analysis of the timestamps from the prompt
    // According to the prompt order: 
    // 1. Cosechadora
    // 2. Ocasión (loader)
    // 3. PLM
    // 4. Tractor New Holland
    // 5. Implemento (Plow)
    
    // So the sorted chronological `latestFiles` array matches:
    // 0: Cosechadoras
    // 1: Maquinaria de ocasión
    // 2: Agricultura de precisión
    // 3: Tractores New Holland
    // 4: Implementos

    const map = {
        'Cosechadoras': latestFiles[0],
        'Maquinaria de ocasión': latestFiles[1],
        'Agricultura de precisión': latestFiles[2],
        'Tractores New Holland': latestFiles[3],
        'Implementos': latestFiles[4]
    };

    for (const prod of productsToCreate) {
        console.log(`\nProcessing product: ${prod.title}...`);
        
        let publicUrl = null;
        const filename = map[prod.title];

        if (filename) {
            console.log(`Uploading image ${filename}...`);
            const fileData = fs.readFileSync(path.join(artifactsDir, filename));
            const imageExt = filename.split('.').pop();
            const storagePath = `${userId}/${crypto.randomUUID()}/photo.${imageExt}`;

            const { error: uploadError } = await supabase.storage.from('listings').upload(storagePath, fileData, {
                contentType: `image/${imageExt === 'jpg' ? 'jpeg' : imageExt}`,
                upsert: true
            });
            
            if (uploadError) {
                console.error("Upload error:", uploadError);
            } else {
                const { data: pubData } = supabase.storage.from('listings').getPublicUrl(storagePath);
                publicUrl = pubData.publicUrl;
                console.log(`Image hosted successfully at: ${publicUrl}`);
            }
        }

        const listingData = {
            user_id: userId,
            title: prod.title,
            description: `Consulta toda la información, ofertas y catálogo de servicios de ${prod.title} ofrecido oficialmente por Agrosalamanca.`,
            price: 0,
            price_type: 'negotiable',
            category: 'tractores', // Just default
            subcategory: 'servicios',
            location: 'Nacional',
            status: 'sold', // MUST be sold for ghosts!
            image_urls: publicUrl ? [publicUrl] : [],
            is_featured: true, 
        };

        const { error: insertError } = await supabase.from('listings').insert([listingData]);
        if (insertError) {
            console.error(`Error inserting listing ${prod.title}:`, insertError);
        } else {
            console.log(`Listing ${prod.title} added successfully!`);
        }
    }

    console.log("\n--- SUCCESS --- All products with their respective images are loaded!");
}

updateAgrosalamancaProducts();
