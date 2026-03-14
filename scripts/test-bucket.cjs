require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
    const { data, error } = await supabase.storage.from("tractores").list("John Deere", { limit: 100 });
    console.log("Error:", error);
    if (data) {
        console.log("Data length:", data.length);
        console.log("First 3 items:", data.slice(0, 3));
    }
}
test();
