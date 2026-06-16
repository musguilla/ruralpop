"use server";

import { createClient } from "@/utils/supabase/server";
import { sendMilestoneReminderEmail } from "@/lib/email/milestone-reminder";

export async function toggleFavorite(listingId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Debes iniciar sesión para añadir a favoritos", code: "UNAUTHORIZED" };
    }

    try {
        // Check if favorite exists
        const { data: existingFav } = await supabase
            .from("favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq("listing_id", listingId)
            .maybeSingle();

        if (existingFav) {
            // Remove it
            const { error } = await supabase
                .from("favorites")
                .delete()
                .eq("id", existingFav.id);

            if (error) throw error;
            return { success: true, isFavorited: false };
        } else {
            // Add it
            const { error } = await supabase
                .from("favorites")
                .insert([{ user_id: user.id, listing_id: listingId }]);

            if (error) throw error;

            // --- MILESTONE LOGIC ---
            // After successfully adding, count the favorites for this listing
            const { count: favCount } = await supabase
                .from("favorites")
                .select("id", { count: "exact", head: true })
                .eq("listing_id", listingId);

            if (favCount === 10 || favCount === 20) {
                const milestoneTag = `_milestone_${favCount}_sent`;
                
                // Fetch the listing to check its tags and get seller's email
                const { data: listingData } = await supabase
                    .from("listings")
                    .select(`
                        id, 
                        title, 
                        image_urls, 
                        tags,
                        users ( email )
                    `)
                    .eq("id", listingId)
                    .single();

                if (listingData) {
                    const currentTags = listingData.tags || [];
                    const sellerEmail = (listingData.users as any)?.email;

                    // If we haven't sent this milestone yet
                    if (!currentTags.includes(milestoneTag) && sellerEmail) {
                        const newTags = [...currentTags, milestoneTag];

                        // Send the email asynchronously
                        sendMilestoneReminderEmail(sellerEmail, {
                            id: listingData.id,
                            title: listingData.title,
                            image_urls: listingData.image_urls
                        }, favCount).catch(err => console.error("Milestone email error:", err));

                        // Update the tags in the database to prevent resending
                        await supabase
                            .from("listings")
                            .update({ tags: newTags })
                            .eq("id", listingId);
                    }
                }
            }
            // -----------------------

            return { success: true, isFavorited: true };
        }
    } catch (error: any) {
        console.error("Error toggling favorite:", error);
        return { error: error.message || "Error al procesar el favorito" };
    }
}

export async function getUserFavorites() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { favorites: [], error: "No autorizado" };
    }

    try {
        const { data: favorites, error } = await supabase
            .from("favorites")
            .select(`
                id,
                created_at,
                listing_id,
                listings (
                    id,
                    title,
                    price,
                    location,
                    image_urls,
                    created_at,
                    category,
                    price_type,
                    status
                )
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return { favorites: favorites || [] };
    } catch (error: any) {
        console.error("Error fetching favorites:", error);
        return { favorites: [], error: error.message || "Error al cargar favoritos" };
    }
}

export async function getUserFavoriteIds() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    try {
        const { data: favorites, error } = await supabase
            .from("favorites")
            .select("listing_id")
            .eq("user_id", user.id);

        if (error) throw error;

        return favorites ? favorites.map((f: any) => f.listing_id) : [];
    } catch (error) {
        console.error("Error fetching favorite ids:", error);
        return [];
    }
}
