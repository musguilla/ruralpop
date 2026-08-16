require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);

    const PAGE_SIZE = 1000;
    let page = 0;
    let total = 0;
    let under3Count = 0;

    while (true) {
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data: listings, error } = await supabaseAdmin
            .from('listings')
            .select('id, title, status, tags')
            .or('tenant_id.eq.ea2490cc-dc33-48f3-bc7b-82b14aa70eb9,tenant_id.is.null')
            .range(from, to);

        if (error || !listings || listings.length === 0) break;

        total += listings.length;
        listings.forEach(l => {
            if (!Array.isArray(l.tags) || l.tags.length < 3) {
                under3Count++;
            }
        });

        if (listings.length < PAGE_SIZE) break;
        page++;
    }

    console.log(`Verification Results: Total Ruralpop listings = ${total} | Listings with < 3 tags = ${under3Count}`);
}

main();
