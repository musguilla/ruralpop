import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
        .from('magazine_posts')
        .update({ published_at: '2026-03-15T10:23:00.000Z' })
        .eq('slug', 'vacuna-trivalente-lengua-azul')
        .select('published_at');
  console.log(data);
  if (error) console.error(error);
}
run();
