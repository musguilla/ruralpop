"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteListing(listingId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("No autenticado");

    const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", listingId)
        .eq("user_id", user.id); // Seguridad extra

    if (error) {
        console.error("Error deleting listing:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard");
}

export async function toggleListingStatus(listingId: string, currentStatus: string, soldPrice?: number | null) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("No autenticado");

    const newStatus = currentStatus === "active" ? "sold" : "active";

    const updateData: any = { status: newStatus };
    if (newStatus === "sold" && soldPrice !== undefined) {
        updateData.sold_price = soldPrice;
    } else if (newStatus === "active") {
        updateData.sold_price = null;
    }

    const { error } = await supabase
        .from("listings")
        .update(updateData)
        .eq("id", listingId)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error updating listing status:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard");
}

export async function updateListing(listingId: string, formData: FormData) {
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

    if (contact_phone && contact_phone.trim().length > 0) {
        await supabase
            .from("users")
            .update({ phone: contact_phone.trim() })
            .eq("id", user.id);
    }

    const { error } = await supabase
        .from("listings")
        .update({
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
            contact_phone
        })
        .eq("id", listingId)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error updating listing:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/anuncio/anuncio-${listingId.substring(0, 8)}`);

    return { success: true };
}
