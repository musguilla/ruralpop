const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPush() {
    const { data: users, error } = await supabase
        .from('users')
        .select('name, email, expo_push_token')
        .not('expo_push_token', 'is', null);

    if (error) {
        console.error("DB Error: ", error);
        return;
    }

    console.log("Tokens in DB:");
    users.forEach(u => {
        console.log(`- ${u.name} (${u.email}): ${u.expo_push_token}`);
    });

    if (users.length > 0) {
        // Test sending to the first user
        const to = users[0].expo_push_token;
        console.log(`Testing push to ${to}...`);
        try {
            const resp = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: to,
                    title: 'Test push from server',
                    body: 'This is a test notification.'
                })
            });
            const result = await resp.json();
            console.log("Push API Result:", JSON.stringify(result, null, 2));
        } catch (err) {
            console.error("Push Request Error:", err);
        }
    } else {
        console.log("No push tokens found in DB.");
    }
}

checkPush();
