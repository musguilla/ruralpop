import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/luis/Personal/__RURALPOP/ruralpopv1/.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1 as val;' });
  console.log("Called exec_sql with sql parameter:", data, error);

  const { data: data2, error: error2 } = await supabase.rpc('exec_sql', { query: 'SELECT 1 as val;' });
  console.log("Called exec_sql with query parameter:", data2, error2);
}
run();
