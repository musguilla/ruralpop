import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/luis/Personal/__RURALPOP/ruralpopv1/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceKey || !anonKey) {
    console.error("Missing supabase env variables");
    process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceKey);
const anonClient = createClient(supabaseUrl, anonKey);

async function run() {
    console.log("=== INSPECTING FAVORITES TABLE ===");
    
    // 1. Fetch total count of favorites in the system with adminClient
    const { count: adminCount, error: adminCountError } = await adminClient
        .from('favorites')
        .select('*', { count: 'exact', head: true });
        
    if (adminCountError) {
        console.error("Admin Client Count Error:", adminCountError);
    } else {
        console.log(`Total favorites in DB (via Admin Client): ${adminCount}`);
    }

    // 2. Fetch total count of favorites in the system with anonClient
    const { count: anonCount, error: anonCountError } = await anonClient
        .from('favorites')
        .select('*', { count: 'exact', head: true });
        
    if (anonCountError) {
        console.error("Anon Client Count Error:", anonCountError);
    } else {
        console.log(`Total favorites in DB visible (via Anon Client): ${anonCount}`);
    }

    // 3. Fetch some sample favorites via Admin
    const { data: adminSamples, error: adminSampleError } = await adminClient
        .from('favorites')
        .select('*')
        .limit(10);
        
    if (adminSampleError) {
        console.error("Admin Client Sample Error:", adminSampleError);
    } else {
        console.log("Sample favorites in DB:", adminSamples);
    }

    // 4. Fetch some sample favorites via Anon
    const { data: anonSamples, error: anonSampleError } = await anonClient
        .from('favorites')
        .select('*')
        .limit(10);
        
    if (anonSampleError) {
        console.error("Anon Client Sample Error:", anonSampleError);
    } else {
        console.log("Sample favorites visible to Anon:", anonSamples);
    }
}

run();
