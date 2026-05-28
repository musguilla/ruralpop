import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
    const { data: authData, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 20 });
    if (error) {
        console.error("Error:", error);
        return;
    }
    console.log("Total users fetched in page 1:", authData.users.length);
    authData.users.slice(0, 10).forEach(u => {
        console.log(`User ID: ${u.id}, Email: ${u.email}, Last Sign In: ${u.last_sign_in_at}`);
    });
}

run();
