import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const matchUrl = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
  const matchKey = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
  if (matchUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = matchUrl[1];
  if (matchKey) process.env.SUPABASE_SERVICE_ROLE_KEY = matchKey[1];
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data: users } = await supabase.from('users').select('id').limit(1);
    const userId = users[0].id;
    // try to insert dummy record to check constraint
    const { data, error } = await supabase.from('listings').insert({
        title: 'test agricultura',
        description: 'test',
        price: 1,
        category: 'agricultura',
        subcategory: 'Semillas',
        user_id: userId,
        location: 'test',
        image_urls: []
    }).select('id');
    console.log("Insert Error:", error);
    if (data && data.length > 0) {
        console.log("Inserted ID:", data[0].id);
        await supabase.from('listings').delete().eq('id', data[0].id);
        console.log("Deleted dummy record.");
    }
}
main();
