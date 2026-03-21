const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const sharp = require('sharp');
const cheerio = require('cheerio');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("🔍 Fetching Avicon user...");
    const { data: users, error } = await supabase
        .from('users')
        .select('id, commercial_name')
        .ilike('commercial_name', '%Avicon%')
        .limit(1);

    if (error || !users || users.length === 0) {
        console.error("❌ Error fetching Avicon user:", error);
        return;
    }

    const userId = users[0].id;

    // We can fetch the base template for common info (location, category, phone, description...)
    // Instead of raw template, we'll just set manual defaults
    const template = {
        user_id: userId,
        description: "Alimentación premium para porcino blanco. Alta calidad y rentabilidad para tu ganadería garantizada por Avicon.",
        price: 0,
        category: "alimentacion",
        location: "Toledo",
        status: "active",
        price_type: "consult"
    };

    console.log("🌐 Using pre-extracted product data...");
    
    const products = [
      {
        "title": "Cerdos crecimiento gránulo saco 30 KG",
        "imgUrl": "https://avicontienda.com/wp-content/uploads/cerdos-7-5-220007-1-1024x1024.jpg"
      },
      {
        "title": "Lechones starter sin medicar harina saco 30 KG",
        "imgUrl": "https://avicontienda.com/wp-content/uploads/lechones-7-5-220011004-1-1024x1024.jpg"
      }
    ];

    console.log(`Found ${products.length} products`);

    for (let p of products) {
        console.log(`\n📦 Processing: ${p.title}`);
        console.log(`   Image: ${p.imgUrl}`);
        
        try {
            // Fetch and optimize image
            const imgRes = await fetch(p.imgUrl);
            const arrayBuffer = await imgRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const optimizedBuffer = await sharp(buffer)
                .resize(1000, 1000, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .jpeg({ quality: 80 }) 
                .toBuffer();

            const storagePath = `${userId}/porcino_${Date.now()}.jpg`;

            console.log(`   Uploading image to Supabase...`);
            const { error: uploadError } = await supabase.storage
                .from('listings')
                .upload(storagePath, optimizedBuffer, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage.from('listings').getPublicUrl(storagePath);
            const newLogoUrl = publicUrlData.publicUrl;
            
            console.log(`   Image uploaded: ${newLogoUrl}`);
            
            // Insert Listing
            const listingData = { ...template, title: p.title, image_urls: [newLogoUrl] };
            
            const { error: insertError } = await supabase.from('listings').insert(listingData);
            if (insertError) throw insertError;
            
            console.log(`   ✅ Listing inserted successfully!`);
        } catch (err) {
            console.error(`   ❌ Failed to process ${p.title}:`, err.message);
        }
    }
    
    console.log("\n🎉 All done!");
}

run();
