import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    let allAuthUsers: any[] = [];
    let page = 1;
    while (page <= 2) { // just check a few
        const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
        if (!authData || !authData.users || authData.users.length === 0) break;
        allAuthUsers = allAuthUsers.concat(authData.users);
        page++;
    }
    
    const sorted = allAuthUsers
        .filter(u => u.last_sign_in_at)
        .sort((a, b) => new Date(b.last_sign_in_at).getTime() - new Date(a.last_sign_in_at).getTime())
        .slice(0, 5);
        
    for (const u of sorted) {
        console.log(u.email, u.last_sign_in_at);
    }
}
main();
