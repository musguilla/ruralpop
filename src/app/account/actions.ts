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
        } else if (
            ["commercial_name", "company_description", "company_address", "company_zip", "company_country", "company_website"].includes(field)
        ) {
            // Actualizar campos de empresa directamente en la tabla users
            const { error } = await supabase
                .from('users')
                .update({ [field]: value })
                .eq('id', user.id);
            if (error) throw error;

            revalidatePath("/account");
            return { success: true };
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
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : "Error al actualizar" };
    }
}

export async function updateUserLocationData(data: { province_id: number | null, municipality_id: string | null, location: string }) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: "No autenticado" };
    }

    try {
        const { error } = await supabase
            .from('users')
            .update({
                province_id: data.province_id,
                municipality_id: data.municipality_id,
                location: data.location
            })
            .eq('id', user.id);

        if (error) throw error;

        revalidatePath("/account");
        return { success: true, message: "Ubicación actualizada correctamente." };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : "Error al actualizar ubicación" };
    }
}

export async function uploadAvatar(formData: FormData) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: "No autenticado" };
    }

    try {
        const file = formData.get("file") as File;
        if (!file) {
            return { success: false, error: "Archivo no encontrado" };
        }

        const fileExt = file.name.split('.').pop() || 'jpg';
        // Unique filename to prevent cache issues
        const filePath = `${user.id}/avatar_${Date.now()}.${fileExt}`;

        // 1. Upload file
        const { error: uploadError } = await supabase.storage
            .from('users')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        // 2. Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('users')
            .getPublicUrl(filePath);

        // 3. Update auth metadata
        const { error: updateError } = await supabase.auth.updateUser({
            data: { avatar_url: publicUrl }
        });
        if (updateError) throw updateError;

        // 4. Update public.users table just in case there's no trigger
        await supabase
            .from('users')
            .update({ avatar_url: publicUrl })
            .eq('id', user.id);

        revalidatePath("/account");
        return { success: true, url: publicUrl };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : "Error al subir avatar" };
    }
}

export async function getMunicipalities(provinceId: number) {
    const supabase = await createClient();
    const { data: municipalities, error } = await supabase
        .from("municipalities")
        .select("id, name")
        .eq("province_id", provinceId)
        .order("name");

    if (error) {
        console.error("Error fetching municipalities:", error);
        return [];
    }

    return municipalities || [];
}
