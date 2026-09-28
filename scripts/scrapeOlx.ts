import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function cleanString(str) {
    if (!str) return "";
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function run() {
    try {
        console.log("Fetching OLX search page...");
        const searchRes = await fetch("https://www.olx.pt/animais/animais-de-quinta/vacas/", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
            }
        });
        
        if (!searchRes.ok) {
            console.log("Failed to fetch search page:", searchRes.status);
            return;
        }
        const searchHtml = await searchRes.text();
        
        const linkMatch = searchHtml.match(/href="(\/d\/anuncio\/[^"]+)"/);
        
        if (!linkMatch) {
            console.log("No ad link found in HTML!");
            return;
        }
        
        const adUrl = "https://www.olx.pt" + linkMatch[1];
        console.log("Fetching ad:", adUrl);
        
        const adRes = await fetch(adUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
            }
        });
        
        const adHtml = await adRes.text();
        
        const stateMatch = adHtml.match(/window\.__PRERENDERED_STATE__\s*=\s*"(.*?)";/);
        let stateObj;
        if (stateMatch) {
            try {
                const decoded = JSON.parse('"' + stateMatch[1] + '"'); 
                stateObj = JSON.parse(decoded);
            } catch (e) {
                console.log("Failed to parse state json");
            }
        }
        
        const adData = stateObj?.ad?.ad;
        if (!adData) {
            console.log("Ad data not found in state");
            return;
        }
        
        const title = adData.title;
        let description = adData.description;
        description = description.replace(/<[^>]*>?/gm, ''); // strip HTML
        
        const locality = adData.location?.cityName || adData.location?.regionName;
        const photo = adData.photos?.[0];
        const sellerName = adData.user?.name || "Vendedor OLX";
        const numericId = adData.id;
        
        let phone = null;
        try {
            const phoneRes = await fetch(`https://www.olx.pt/api/v1/offers/${numericId}/phones/`, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
                    "Accept": "application/json"
                }
            });
            if (phoneRes.ok) {
                const phoneData = await phoneRes.json();
                phone = phoneData?.data?.phones?.[0];
            }
        } catch (e) {
            console.log("Could not fetch phone.");
        }
        
        console.log("--- SCRAPED DATA ---");
        console.log("Title:", title);
        console.log("Locality:", locality);
        console.log("Photo:", photo);
        console.log("Seller:", sellerName);
        console.log("Ad ID:", numericId);
        console.log("Phone:", phone);
        
        const safeName = cleanString(sellerName) || "user";
        const userEmail = `${safeName}_${numericId}@ruralpop.com`;
        
        console.log("Checking/Creating ghost user:", userEmail);
        
        let sellerId = null;
        const { data: existingUser } = await supabase.from('users').select('id').eq('email', userEmail).single();
        
        if (existingUser) {
            sellerId = existingUser.id;
            console.log("Using existing user:", sellerId);
        } else {
            // Need to insert into Supabase auth and then users table!
            // Wait, Supabase auth.users can only be created via admin API or we just bypass auth and insert into public.users?
            // Some apps require auth.users to exist first due to foreign keys. Let's try inserting just to public.users first to see if it allows it, or use admin auth API.
            
            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                email: userEmail,
                password: 'password123',
                email_confirm: true,
                user_metadata: { name: sellerName, is_ghost: true }
            });
            
            if (authError) {
                console.error("Auth creation error:", authError.message);
                
                // If it says already registered, fetch it
                const { data: allUsers } = await supabase.auth.admin.listUsers();
                const found = allUsers.users.find(u => u.email === userEmail);
                if (found) {
                    sellerId = found.id;
                } else {
                    return;
                }
            } else {
                sellerId = authUser.user.id;
                
                // Now insert/update public.users
                await supabase.from('users').upsert({
                    id: sellerId,
                    email: userEmail,
                    name: sellerName,
                    phone: phone || null,
                    is_ghost: true,
                    created_at: new Date().toISOString()
                });
                console.log("Created new ghost user:", sellerId);
            }
        }

        const adPayload = {
            title: title,
            title_pt: title,
            description: description,
            description_pt: description,
            price: adData.price?.regularPrice?.value || 0,
            location: locality,
            image_urls: photo ? [photo] : [],
            user_id: sellerId,
            status: "active",
            category: "ganaderia",
            subcategory: "bovino",
            province_id: 101, // Aveiro 
            municipality_id: 100000, 
            contact_phone: phone || "000000000"
        };
        
        const { error } = await supabase.from('listings').insert(adPayload);
        if (error) {
            console.error("Supabase insert error:", error);
        } else {
            console.log("Test ad successfully inserted with specific seller!");
        }
        
    } catch (e) {
        console.error("Error during scraping:", e.message);
    }
}

run();
