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
const MAX_IMAGE_SIZE = 400; // 400x400 pixels for a logo

async function run() {
    console.log("🔍 Fetching Agrolugo user...");
    const { data: users, error } = await supabase
        .from('users')
        .select('id, commercial_name')
        .ilike('commercial_name', '%Agrolugo%')
        .limit(1);

    if (error || !users || users.length === 0) {
        console.error("❌ Error fetching Agrolugo user:", error);
        return;
    }

    const company = users[0];
    const userId = company.id;
    console.log(`✅ Found Agrolugo user: ${company.commercial_name} (${userId})`);

    const imagePath = '/Users/luis/.gemini/antigravity/brain/54bd403f-9554-41a2-b0dd-1df7a41a8985/media__1774098430950.png';
    console.log(`🖼  Reading image from ${imagePath}...`);

    try {
        const imageBuffer = fs.readFileSync(imagePath);
        
        // Optimize with sharp
        console.log(`🛠  Optimizing image...`);
        const optimizedBuffer = await sharp(imageBuffer)
            .resize(MAX_IMAGE_SIZE, MAX_IMAGE_SIZE, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .png({ quality: 90 }) // using png to keep transparency
            .toBuffer();

        const storagePath = `${userId}/new_logo_${Date.now()}.png`;

        console.log(`☁️  Uploading to Supabase Storage at 'users/${storagePath}'...`);
        const { error: uploadError } = await supabase.storage
            .from('users')
            .upload(storagePath, optimizedBuffer, {
                contentType: 'image/png',
                upsert: true
            });

        if (uploadError) {
            throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage.from('users').getPublicUrl(storagePath);
        const newLogoUrl = publicUrlData.publicUrl;
        
        console.log(`🔗 New Logo URL: ${newLogoUrl}`);
        
        console.log(`🔄 Updating user record in database...`);
        const { error: updateError } = await supabase
            .from('users')
            .update({ 
                avatar_url: newLogoUrl,
                company_logo_url: newLogoUrl
            })
            .eq('id', userId);
            
        if (updateError) {
            throw updateError;
        }
        
        console.log(`🎉 SUCCESS! Agrolugo logo updated to the new attachment.`);

    } catch (err) {
        console.error(`❌ Error updating logo:`, err.message);
    }
}

run();
