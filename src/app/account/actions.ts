"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserData(field: string, value: string) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: "No autenticado" };
    }

    try {
        if (field === "email") {
            const { error } = await supabase.auth.updateUser({ email: value });
            if (error) throw error;
            return { success: true, message: "Enlace de confirmación enviado a tu nuevo email." };
        } else {
            // Actualizar metadata para nombre y teléfono
            const { error } = await supabase.auth.updateUser({
                data: {
                    [field]: value
                }
            });
            if (error) throw error;

            revalidatePath("/account");
            return { success: true };
        }
    } catch (e: any) {
        return { success: false, error: e.message || "Error al actualizar" };
    }
}
