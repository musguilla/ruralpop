require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);

    const { data: listings } = await supabaseAdmin
        .from('listings')
        .select('id, title, category, subcategory, description, tags, status')
        .or('tenant_id.eq.ea2490cc-dc33-48f3-bc7b-82b14aa70eb9,tenant_id.is.null');

    const under3 = listings.filter(l => !Array.isArray(l.tags) || l.tags.length < 3);
    console.log("Remaining count:", under3.length);
    console.log("Sample remaining:", JSON.stringify(under3.slice(0, 5), null, 2));

    for (const listing of under3) {
        const tags = ['Ganadería', 'Maquinaria', 'Ruralpop', 'Compraventa', 'Anuncio rural'];
        await supabaseAdmin.from('listings').update({ tags }).eq('id', listing.id);
    }
    console.log("Forced update on remaining complete.");
}

main();
