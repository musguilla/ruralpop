"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createListing(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("No autenticado");
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const subcategory = formData.get("subcategory") as string;
    const location = formData.get("location") as string;
    const contact_phone = formData.get("contact_phone") as string | null;
    const price_type = formData.get("price_type") as string;
    const imageUrlsString = formData.get("image_urls") as string;
    const image_urls = imageUrlsString ? JSON.parse(imageUrlsString) : [];

    // Si el usuario puso un teléfono, lo guardamos en su perfil también
    // (para no tener que volver a escribirlo en el siguiente anuncio)
    if (contact_phone && contact_phone.trim().length > 0) {
        await supabase
            .from("users")
            .update({ phone: contact_phone.trim() })
            .eq("id", user.id);
    }

    const { error } = await supabase.from("listings").insert({
        title,
        description,
        price,
        category,
        subcategory: subcategory || null,
        location,
        price_type,
        image_urls,
        user_id: user.id,
        status: "active"
    });

    if (error) {
        console.error("Error creating listing:", error);
        return { error: error.message };
    }

    revalidatePath("/");
    return { success: true };
}
