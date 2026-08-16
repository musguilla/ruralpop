require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);

    // Some UUIDs from the migration log
    const ids = [
        '02290287-aedc-45c2-a04c-3cea639030e0',
        '9deeef9e-c3d4-403b-be10-cd9226f51f3c',
        'dea7eebe-5dfa-4698-b08f-c571338b1fc7',
        '07a35f29-59eb-42eb-a17e-9267de711ee8',
        '6d645f73-72c4-42ca-91bc-9953254993c4'
    ];

    const { data } = await supabaseAdmin
        .from('listings')
        .select('title, created_at')
        .in('id', ids);

    console.log(data);
}

main();
