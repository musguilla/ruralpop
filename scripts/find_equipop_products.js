require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);

    const titlesToSearch = [
        "SILLA DE SALTO EQUILINE E5",
        "SILLA DE SALTO EQUILINE E4",
        "SILLA DE SALTO EQUILINE J CHALLENGE",
        "SILLA DE SALTO EQUILINE TALENT",
        "SILLA ING.USO GENERAL LEXHIS ISTRIA",
        "SILLA INGLESA DE SALTO LEXHIS ILUSA",
        "SILLA INGLESA DE SALTO LEXHIS FULVIA"
    ];

    console.log("=== Searching for listings matching screenshot titles ===");

    const { data: listings, error } = await supabaseAdmin
        .from('listings')
        .select('id, title, status, location, image_urls, user_id, shared_to_equipop, tenant_id')
        .or(titlesToSearch.map(t => `title.ilike.%${t}%`).join(','));

    if (error) {
        console.error("Search error:", error);
        return;
    }

    console.log(`Found ${listings?.length} matching listings:`);
    console.log(JSON.stringify(listings, null, 2));

    if (listings && listings.length > 0) {
        const userId = listings[0].user_id;
        console.log(`\n=== Checking all listings for user ${userId} ===`);
        const { data: userListings } = await supabaseAdmin
            .from('listings')
            .select('id, title, status, location, image_urls, shared_to_equipop')
            .eq('user_id', userId);

        console.log(`User has ${userListings?.length} total listings.`);
        console.log(JSON.stringify(userListings, null, 2));
    }
}

main();
