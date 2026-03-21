const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Updating DOMAG logo...");
    
    // Find DOMAG user
    const { data: user, error: errorUser } = await supabase.from('users').select('id, commercial_name').eq('commercial_name', 'DOMAG').single();
    if (errorUser || !user) {
        console.error("Error fetching DOMAG:", errorUser);
        return;
    }

    const artifactsDir = '/Users/luis/.gemini/antigravity/brain/54bd403f-9554-41a2-b0dd-1df7a41a8985';
    const files = fs.readdirSync(artifactsDir).filter(f => f.startsWith('media__') && (f.endsWith('.png') || f.endsWith('.jpg'))).sort();
    const latestFile = files[files.length - 1];
    
    if (latestFile) {
        const filePath = path.join(artifactsDir, latestFile);
        const fileData = fs.readFileSync(filePath);
        
        const storagePath = `${user.id}/logo_${Date.now()}.png`; 
        console.log(`Uploading new DOMAG logo from ${latestFile}...`);
        await supabase.storage.from('users').upload(storagePath, fileData, { contentType: 'image/png', upsert: true });
        
        const { data: pubData } = supabase.storage.from('users').getPublicUrl(storagePath);
        const newLogoUrl = pubData.publicUrl;
        console.log("DOMAG logo uploaded:", newLogoUrl);

        console.log(`Updating DOMAG in DB...`);
        const { error: updErr } = await supabase.from('users').update({
            avatar_url: newLogoUrl,
            company_logo_url: newLogoUrl
        }).eq('id', user.id);
        
        if (updErr) {
            console.error(`Error updating DOMAG:`, updErr);
        } else {
            console.log(`DOMAG updated successfully!`);
        }
    } else {
        console.log("WARNING: Could not find the new DOMAG logo in artifacts.");
    }
}

run();
