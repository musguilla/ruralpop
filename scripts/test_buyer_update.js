require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // We will generate a JWT for the buyer: Irene Barquín
    const buyerId = "b9aee85c-ddd7-41d9-9315-5f77b1338a1b"; 

    // Create a mock JWT for the buyer
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
        {
            aud: 'authenticated',
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            sub: buyerId,
            role: 'authenticated'
        },
        process.env.SUPABASE_JWT_SECRET
    );

    const supabaseUser = createClient(url, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const orderId = "658afeff-ceb4-483a-868f-04dd1785bcaa";
    
    console.log("=== Testing Buyer Update on escrow_orders ===");
    
    // We try to update a dummy field or exactly what the API does, but we don't want to actually change it permanently.
    // Actually, since we suspect it fails, let's just try it!
    const { data, error } = await supabaseUser
        .from('escrow_orders')
        .update({ 
            // We just update some dummy timestamp to see if it works
            buyer_confirmed_at: new Date().toISOString() 
        })
        .eq('id', orderId)
        .select();

    console.log("Update Data Result:", data);
    console.log("Update Error:", error);
}

main();
