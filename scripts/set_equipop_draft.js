require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);

    const targetIds = [
        "284b6ff2-5e83-4ae8-ae99-3dde7c5df184",
        "e8ea6dd4-8455-4256-a282-800b9622b491",
        "60045c31-a2df-4c58-b77b-6d806ea77a47",
        "81b21763-adce-4f52-b455-aac9ee777ce4",
        "d184a9ee-0a95-40bd-87d1-82cf8d2112fc",
        "e18440c0-1b34-4527-ab91-e8a0f78c7d78",
        "589be7eb-ae04-46d5-b42b-d10b7e7ffafe",
        "32eccb87-08bc-4118-88cc-3a7af5c7659c"
    ];

    console.log(`=== Marking ${targetIds.length} listings as DRAFT ===`);

    const { data, error } = await supabaseAdmin
        .from('listings')
        .update({ status: 'draft' })
        .in('id', targetIds)
        .select('id, title, status');

    if (error) {
        console.error("Update error:", error);
    } else {
        console.log(`✅ Successfully updated ${data?.length} listings to status 'draft':`);
        console.log(JSON.stringify(data, null, 2));
    }
}

main();
