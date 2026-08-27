import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
        
    let allAuthUsers: any[] = [];
    let page = 1;
    while (true) {
        const { data: authData, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
        if (error || !authData || !authData.users || authData.users.length === 0) break;
        allAuthUsers = allAuthUsers.concat(authData.users);
        if (authData.users.length < 1000) break;
        page++;
    }
    
    let active = 0;
    for (const u of allAuthUsers) {
        if (u.last_sign_in_at && new Date(u.last_sign_in_at) >= todayStart) {
            active++;
        }
    }
    console.log("Total users fetched:", allAuthUsers.length, "Active today:", active);
}
main();
