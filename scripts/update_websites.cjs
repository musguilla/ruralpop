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
    console.log("Updating ghost profiles with websites and new Transconcar logo...");
    
    // 1. Get the users
    const { data: users, error: errorUsers } = await supabase.from('users').select('id, commercial_name').in('commercial_name', ['Transconcar', 'De Heus', 'Ixorigue']);
    if (errorUsers) {
        console.error("Error fetching users:", errorUsers);
        return;
    }
    
    const transconcar = users.find(u => u.commercial_name.toLowerCase().includes('transconcar'));
    const deheus = users.find(u => u.commercial_name.toLowerCase().includes('de heus'));
    const ixorigue = users.find(u => u.commercial_name.toLowerCase().includes('ixorigue'));

    // 2. Upload new logo for Transconcar
    let newTransconcarLogoUrl = null;
    if (transconcar) {
        const artifactsDir = '/Users/luis/.gemini/antigravity/brain/54bd403f-9554-41a2-b0dd-1df7a41a8985';
        const files = fs.readdirSync(artifactsDir).filter(f => f.startsWith('media__') && (f.endsWith('.png') || f.endsWith('.jpg'))).sort();
        const latestFile = files[files.length - 1]; // The latest one
        
        if (latestFile) {
            const filePath = path.join(artifactsDir, latestFile);
            const fileData = fs.readFileSync(filePath);
            
            const storagePath = `${transconcar.id}/logo_${Date.now()}.png`; // png or jpg depending on actual format but supabase serves it ok
            console.log(`Uploading new Transconcar logo from ${latestFile}...`);
            await supabase.storage.from('users').upload(storagePath, fileData, { contentType: 'image/png', upsert: true });
            
            const { data: pubData } = supabase.storage.from('users').getPublicUrl(storagePath);
            newTransconcarLogoUrl = pubData.publicUrl;
            console.log("Transconcar logo uploaded:", newTransconcarLogoUrl);
        } else {
            console.log("WARNING: Could not find the new Transconcar logo in artifacts.");
        }
    }

    // 3. Perform Updates
    const updates = [
        {
            user: transconcar,
            website: 'https://www.transconcar.es/',
            logo: newTransconcarLogoUrl
        },
        {
            user: deheus,
            website: 'https://www.deheus.es/',
            logo: null
        },
        {
            user: ixorigue,
            website: 'https://ixorigue.com/',
            logo: null
        }
    ];

    for (const update of updates) {
        if (!update.user) continue;
        
        let payload = { company_website: update.website };
        if (update.logo) {
            payload.avatar_url = update.logo;
            payload.company_logo_url = update.logo;
        }
        
        console.log(`Updating ${update.user.commercial_name}...`);
        const { error: updErr } = await supabase.from('users').update(payload).eq('id', update.user.id);
        
        if (updErr) {
            console.error(`Error updating ${update.user.commercial_name}:`, updErr);
        } else {
            console.log(`${update.user.commercial_name} updated successfully!`);
        }
    }
    
    console.log("All updates finished.");
}

run();
