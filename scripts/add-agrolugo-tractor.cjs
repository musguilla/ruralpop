const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const sharp = require('sharp');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("🔍 Fetching Agrolugo user...");
    const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .ilike('commercial_name', '%Agrolugo%')
        .limit(1);

    if (error || !users || users.length === 0) {
        console.error("❌ Error fetching Agrolugo user:", error);
        return;
    }

    const company = users[0];
    const userId = company.id;
    console.log(`✅ Found Agrolugo user: ${company.commercial_name} (${userId})`);

    const imagePath = '/Users/luis/.gemini/antigravity/brain/54bd403f-9554-41a2-b0dd-1df7a41a8985/media__1774102636546.png';
    const title = 'Minitractor Farmatrac FT 26 H';
    
    console.log(`🖼  Reading image from ${imagePath}...`);

    try {
        const imageBuffer = fs.readFileSync(imagePath);
        
        // Optimize with sharp
        console.log(`🛠  Optimizing image...`);
        const optimizedBuffer = await sharp(imageBuffer)
            .resize(1000, 1000, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .jpeg({ quality: 85 })
            .toBuffer();

        const storagePath = `${userId}/tractor_${Date.now()}.jpg`;

        console.log(`☁️  Uploading to Supabase Storage at 'listings/${storagePath}'...`);
        const { error: uploadError } = await supabase.storage
            .from('listings')
            .upload(storagePath, optimizedBuffer, {
                contentType: 'image/jpeg',
                upsert: true
            });

        if (uploadError) {
            throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage.from('listings').getPublicUrl(storagePath);
        const newImageUrl = publicUrlData.publicUrl;
        
        console.log(`🔗 Image URL: ${newImageUrl}`);
        
        console.log(`🔄 Inserting listing record in database...`);
        
        const listingData = {
            user_id: userId,
            title: title,
            description: "Espectacular minitractor moderno, perfecto para granjas e instalaciones avícolas. Farmatrac FT 26 H compacto con máxima potencia. Agrolugo Maquinaria Premium.",
            price: 0,
            price_type: 'consult',
            category: 'maquinaria',
            location: company.location || 'Lugo',
            contact_phone: company.phone || company.contact_phone || '',
            image_urls: [newImageUrl],
            status: 'active'
        };
        
        const { error: insertError } = await supabase.from('listings').insert(listingData);
            
        if (insertError) {
            throw insertError;
        }
        
        console.log(`🎉 SUCCESS! Listing created for ${title}.`);

    } catch (err) {
        console.error(`❌ Error inserting listing:`, err.message);
    }
}

run();
