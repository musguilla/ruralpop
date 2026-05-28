import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RURALPOP_TENANT_ID = 'ea2490cc-dc33-48f3-bc7b-82b14aa70eb9';

async function migrate() {
    console.log("Migrando registros con tenant_id NULL a Ruralpop...");

    // 1. Migrar Listings
    const { data: listings, error: lError } = await supabase
        .from('listings')
        .update({ tenant_id: RURALPOP_TENANT_ID })
        .is('tenant_id', null)
        .select('id');

    if (lError) {
        console.error("Error migrando listings:", lError);
    } else {
        console.log(`✅ ${listings?.length || 0} anuncios migrados.`);
    }

    // 2. Migrar Users
    const { data: users, error: uError } = await supabase
        .from('users')
        .update({ tenant_id: RURALPOP_TENANT_ID })
        .is('tenant_id', null)
        .select('id');

    if (uError) {
        console.error("Error migrando users:", uError);
    } else {
        console.log(`✅ ${users?.length || 0} usuarios migrados.`);
    }

    console.log("Migración completada.");
}

migrate();
