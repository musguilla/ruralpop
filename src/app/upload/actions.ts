"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
    const contact_phone = formData.get("contact_phone") as string;
    const price_type = formData.get("price_type") as string;
    const imageUrlsString = formData.get("image_urls") as string;
    const image_urls = imageUrlsString ? JSON.parse(imageUrlsString) : [];

    const { error } = await supabase.from("listings").insert({
        title,
        description,
        price,
        category,
        subcategory: subcategory || null,
        location,
        contact_phone,
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
    redirect("/");
}
