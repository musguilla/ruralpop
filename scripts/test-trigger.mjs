import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { query: `
    SELECT tgname, tgenabled
    FROM pg_trigger
    WHERE tgrelid = 'magazine_posts'::regclass;
  `});
  console.log(data, error);
}
run();
