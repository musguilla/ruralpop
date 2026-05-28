import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: '/Users/luis/Personal/__RURALPOP/ruralpopv1/.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { query: `
    SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
    FROM pg_policies
    WHERE tablename = 'favorites';
  `});
  
  if (error) {
    console.error("Error executing query:", error);
    return;
  }
  
  console.log("Current policies on 'favorites' table:");
  console.log(JSON.stringify(data, null, 2));

  // Let's also check if RLS is enabled on favorites
  const { data: rlsData, error: rlsError } = await supabase.rpc('execute_sql', { query: `
    SELECT relname, relrowsecurity 
    FROM pg_class 
    WHERE relname = 'favorites';
  `});

  if (rlsError) {
    console.error("Error checking RLS status:", rlsError);
    return;
  }
  console.log("RLS Status of 'favorites':");
  console.log(JSON.stringify(rlsData, null, 2));
}

run();
