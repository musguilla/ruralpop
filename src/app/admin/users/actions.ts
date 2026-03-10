"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/utils/supabase/server";

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function updateUser(userId: string, data: { name?: string, role?: string, location?: string }) {
    const supabaseSession = await createServerClient();
    const { data: { user } } = await supabaseSession.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const supabaseAdmin = getAdminClient();
    const { data: callerProfile } = await supabaseAdmin.from("users").select("role").eq("id", user.id).single();

    if (callerProfile?.role !== "admin") throw new Error("Forbidden");

    const { error } = await supabaseAdmin.from("users").update(data).eq("id", userId);

    if (error) {
        console.error("Update error:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/users");
    return { success: true };
}

export async function deleteUser(userId: string) {
    const supabaseSession = await createServerClient();
    const { data: { user } } = await supabaseSession.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const supabaseAdmin = getAdminClient();
    const { data: callerProfile } = await supabaseAdmin.from("users").select("role").eq("id", user.id).single();

    if (callerProfile?.role !== "admin") throw new Error("Forbidden");

    // Evitamos banearse a uno mismo
    if (userId === user.id) {
        return { success: false, error: "No puedes borrar tu propia cuenta de administrador" };
    }

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
        console.error("Auth delete error:", authError);
        return { success: false, error: authError.message };
    }

    revalidatePath("/admin/users");
    return { success: true };
}
