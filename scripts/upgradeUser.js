require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const email = 'oficinacunimar@gmail.com';
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
    
    if (error) {
        console.error("Error finding user:", error);
        return;
    }
    
    console.log("Found user:", user.name, user.commercial_name);
    
    const commName = user.commercial_name || 'Oficina Cunimar';
    
    const { error: updateError } = await supabase.from('users').update({
        role: 'profesional',
        plan_type: 'pro',
        available_bumps: 6,
        available_featured: 2,
        commercial_name: commName,
        plan_renews_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year free
    }).eq('id', user.id);
    
    if (updateError) {
        console.error("Error upgrading user:", updateError);
    } else {
        console.log(`Successfully upgraded ${email} to PRO store with name "${commName}".`);
    }
}
run();
