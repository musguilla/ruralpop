import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    // Check if location columns exist
    const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching user:', error);
    } else if (userData && userData.length > 0) {
        console.log('Columns in users table:', Object.keys(userData[0]).join(', '));
    } else {
        console.log('No users found to inspect');
    }
}

run();
