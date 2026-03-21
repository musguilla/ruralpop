const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const logoUrl = "https://scontent-mad2-1.cdninstagram.com/v/t51.2885-15/449823556_519602357066579_1321145909805647246_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-mad2-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2gHrgU_Dw8fHUAg2QrDQDY_3_JMK9bSq4NtbnbH5_-QpKBJP3lo6RE05wC6Xw3MGM3k&_nc_ohc=JvU5XVNMejsQ7kNvwE7sxzB&_nc_gid=UrhP0ra982TDfsL0J561xw&edm=AGW0Xe4BAAAA&ccb=7-5&oh=00_AfyTcGcl2E9SadVq7EhbiSb2v0nl-4xtmGhPp80wduK_rg&oe=69C26048&_nc_sid=94fea1";

async function fix() {
    const { data: user } = await supabase.from('users').select('id, email').eq('email', 'info@ixorigue.com').single();
    if (!user) {
        console.error("User info@ixorigue.com not found!");
        return;
    }
    
    console.log(`Downloading logo from Instagram...`);
    const res = await fetch(logoUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
    });
    
    if (!res.ok) {
        console.error("Failed to download logo:", res.status, res.statusText);
        return;
    }
    
    const buffer = await res.arrayBuffer();
    
    const storagePath = `${user.id}/logo.jpg`;
    console.log(`Uploading to users bucket at ${storagePath}...`);
    
    const { error: uploadError } = await supabase.storage.from('users').upload(storagePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true
    });
    
    if (uploadError) {
        console.error("Upload error:", uploadError);
        return;
    }
    
    const { data: pubData } = supabase.storage.from('users').getPublicUrl(storagePath);
    const finalUrl = pubData.publicUrl;
    
    console.log(`Updating user to use local URL: ${finalUrl}`);
    
    const { error: updateError } = await supabase.from('users').update({
        avatar_url: finalUrl,
        company_logo_url: finalUrl
    }).eq('id', user.id);
    
    if (updateError) {
        console.error("Failed to update user:", updateError);
        return;
    }
    
    console.log("SUCCESS! Ixorigue logo successfully hosted locally.");
}

fix();
