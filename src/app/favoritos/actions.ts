"use server";

import { createClient } from "@/utils/supabase/server";

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
