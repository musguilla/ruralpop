import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
    // Buscar cualquier anuncio que tenga el array de tags poblado y que tenga provincia
    const { data, error } = await supabase
        .from('listings')
        .select('id, title, tags, province_id, status')
        .not('tags', 'eq', '{}')
        .limit(10);
    console.log("Error:", error);
    console.log("Anuncios con tags:", JSON.stringify(data, null, 2));
}
check();
