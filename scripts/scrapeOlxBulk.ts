import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function cleanString(str) {
    if (!str) return "";
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}


const PT_REGIONS = {
    'aveiro': 101,
    'beja': 102,
    'braga': 103,
    'braganca': 104,
    'bragança': 104,
    'castelo branco': 105,
    'coimbra': 106,
    'evora': 107,
    'évora': 107,
    'faro': 108,
    'guarda': 109,
    'leiria': 110,
    'lisboa': 111,
    'portalegre': 112,
    'porto': 113,
    'santarem': 114,
    'santarém': 114,
    'setubal': 115,
    'setúbal': 115,
    'viana do castelo': 116,
    'vila real': 117,
    'viseu': 118
};

function getProvinceId(regionName) {
    if (!regionName) return 101; // default to Aveiro
    const key = regionName.toLowerCase().trim();
    return PT_REGIONS[key] || 101;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
    try {
        
        let totalCount = 0;
        
        for (let page = 1; page <= 5; page++) {
            console.log(`\n--- Fetching OLX search page ${page}...`);
            const searchRes = await fetch(`https://www.olx.pt/animais/cavalos/?page=${page}`, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
                }
            });
            
            if (!searchRes.ok) {
                console.log("Failed to fetch search page:", searchRes.status);
                break;
            }
            const searchHtml = await searchRes.text();
            
            const stateMatch = searchHtml.match(/window\.__PRERENDERED_STATE__\s*=\s*"(.*?)";/);
            let elements = [];
            if (stateMatch) {
                const decoded = JSON.parse('"' + stateMatch[1] + '"'); 
                const stateObj = JSON.parse(decoded);
                elements = stateObj?.listing?.listing?.ads || [];
            }
            
            if (elements.length === 0) {
                console.log("No more ads found. Stopping pagination.");
                break;
            }
            
            console.log(`Found ${elements.length} ads on page ${page}. Starting insert...`);
            let count = 0;
            
            for (const adData of elements) {
                const { data: existingListing } = await supabase.from('listings').select('id').eq('title_pt', adData.title).single();
                if (existingListing) {
                    console.log(`Skipping: "${adData.title}" (already exists)`);
                    continue;
                }

                const title = adData.title;
                let description = adData.description;
                description = description.replace(/<[^>]*>?/gm, ''); 
                
                const locality = adData.location?.cityName || adData.location?.regionName;
                const photo = adData.photos?.[0];
                const sellerName = adData.user?.name || "Vendedor OLX";
                const numericId = adData.id;
                
                let phone = null;
                if (adData.contact?.phone) {
                    try {
                        const phoneRes = await fetch(`https://www.olx.pt/api/v1/offers/${numericId}/phones/`, {
                            headers: {
                                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                                "Accept": "application/json"
                            }
                        });
                        if (phoneRes.ok) {
                            const phoneData = await phoneRes.json();
                            phone = phoneData?.data?.phones?.[0];
                        }
                    } catch (e) {}
                }
                
                const safeName = cleanString(sellerName) || "user";
                const userEmail = `${safeName}_${numericId}@ruralpop.com`;
                
                let sellerId = null;
                const { data: existingUser } = await supabase.from('users').select('id').eq('email', userEmail).single();
                
                if (existingUser) {
                    sellerId = existingUser.id;
                } else {
                    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                        email: userEmail,
                        password: 'password123',
                        email_confirm: true,
                        user_metadata: { name: sellerName, is_ghost: true }
                    });
                    
                    if (authError) {
                        const { data: allUsers } = await supabase.auth.admin.listUsers();
                        const found = allUsers.users.find(u => u.email === userEmail);
                        if (found) sellerId = found.id;
                    } else {
                        sellerId = authUser.user.id;
                        await supabase.from('users').upsert({
                            id: sellerId,
                            email: userEmail,
                            name: sellerName,
                            phone: phone || null,
                            is_ghost: true,
                            created_at: new Date().toISOString()
                        });
                    }
                }

                if (!sellerId) {
                    continue;
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
                    subcategory: "equino",
                    province_id: getProvinceId(adData.location?.regionName), 
                    municipality_id: 100000, 
                    contact_phone: phone || "000000000"
                };
                
                const { error } = await supabase.from('listings').insert(adPayload);
                if (error) {
                    console.error(`Error inserting "${title}":`, error.message);
                } else {
                    console.log(`✅ Inserted: "${title}"`);
                    count++;
                    totalCount++;
                }
                
                await sleep(500);
            }
        }
        console.log(`\nBulk scrape finished! Inserted ${totalCount} new ads in total.`);

        
    } catch (e) {
        console.error("Error during bulk scraping:", e.message);
    }
}

run();
