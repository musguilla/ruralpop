const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
    const { count: uCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const authData = await supabase.auth.admin.listUsers();
    const authCount = authData.data?.users?.length || 0;
    const { count: lCount } = await supabase.from('listings').select('*', { count: 'exact', head: true });
    console.log('Total users (users table):', uCount);
    //console.log('Total auth users:', authCount); // Solo trae una página
    console.log('Total listings:', lCount);
}
run();
