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

    // Convert to integers
    const provStr = formData.get("province_id") as string;
    const muniStr = formData.get("municipality_id") as string;
    const province_id = provStr ? parseInt(provStr, 10) : null;
    const municipality_id = muniStr ? parseInt(muniStr, 10) : null;

    const contact_phone = formData.get("contact_phone") as string | null;
    const price_type = formData.get("price_type") as string;
    const vender_online = formData.get("vender_online") === "true";
    const shippingStr = formData.get("shipping_price") as string;
    const shipping_price = (vender_online && shippingStr) ? parseFloat(shippingStr) : 0;
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

    const { data: insertedData, error } = await supabase.from("listings").insert({
        title,
        description,
        price,
        category,
        subcategory: subcategory || null,
        location,
        province_id,
        municipality_id,
        price_type,
        vender_online,
        shipping_price,
        image_urls,
        user_id: user.id,
        status: "active"
    }).select('id').single();

    if (error) {
        console.error("Error creating listing:", error);
        return { error: error.message };
    }

    revalidatePath("/");
    return { success: true, listingId: insertedData.id };
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
