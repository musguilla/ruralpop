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

export async function toggleListingStatus(listingId: string, currentStatus: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("No autenticado");

    const newStatus = currentStatus === "active" ? "sold" : "active";

    const { error } = await supabase
        .from("listings")
        .update({ status: newStatus })
        .eq("id", listingId)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error updating listing status:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard");
}
