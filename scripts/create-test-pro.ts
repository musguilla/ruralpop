import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createProUser() {
    const email = "testpro@ruralpop.com";
    const password = "Password123!";

    console.log(`Checking user: ${email}...`);

    let userId;
    
    // Check if exists
    const { data: users } = await supabase.auth.admin.listUsers();
    const existing = users.users.find(u => u.email === email);
    
    if (existing) {
        console.log("User already exists in Auth. Updating fields...");
        userId = existing.id;
    } else {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });

        if (authError) {
            console.error("Auth creation error:", authError);
            return;
        }
        userId = authData?.user?.id;
    }

    if (!userId) {
        console.error("Could not find user ID.");
        return;
    }

    await updateUserRecord(userId);
}

async function updateUserRecord(userId: string) {
    console.log(`Updating record for user ID: ${userId}...`);
    const { error } = await supabase
        .from("users")
        .update({
            role: "profesional",
            plan_type: "pro",
            commercial_name: "Empresa de Pruebas Ruralpop",
            company_description: "Somos una empresa creada automáticamente para probar las funcionalidades del área de profesionales.",
            company_address: "Calle Falsa 123",
            company_zip: "28000",
            company_country: "España",
            available_bumps: 6,
            available_featured: 2,
            plan_renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq("id", userId);

    if (error) {
        console.error("Error updating user table:", error);
    } else {
        console.log("✅ Professional Test User created and configured successfully!");
        console.log("-----------------------------------------");
        console.log("Email: testpro@ruralpop.com");
        console.log("Password: Password123!");
        console.log("Role: profesional");
        console.log("Plan: PRO");
        console.log("-----------------------------------------");
    }
}

createProUser();
