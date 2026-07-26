import React from 'react';
import { headers } from "next/headers";
import { getDictionary } from "@/i18n/dictionaries";
import { LocaleCode } from "@/i18n/config";
import { createClient } from "@/utils/supabase/server";
import { type Listing } from "@/components/ui/ListingCard";
import { ListingSlider } from "@/components/ui/ListingSlider";
import { getUserFavoriteIds } from "@/app/favoritos/actions";
import { getServerTenantFilterString } from "@/utils/tenant/server";

export async function HomeFeaturedSlider() {
    const supabase = await createClient();
    const tenantFilterString = await getServerTenantFilterString();

    const headersList = await headers();
    const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
    const t = await getDictionary(locale);

    let query = supabase
        .from("listings")
        .select(`
            id, title, title_pt, description_pt, price, location, image_urls, created_at, category, price_type, is_featured,
            users!inner(is_ghost)
        `)
        .eq("status", "active")
        .eq("is_featured", true)
        .eq("users.is_ghost", false)
        .order("created_at", { ascending: false })
        .limit(10); // Límite razonable para un slider horizontal

    query = query.or(tenantFilterString);

    const { data: listings, error } = await query;

    if (error) {
        console.error("Error fetching featured listings:", error);
        return null;
    }

    if (!listings || listings.length === 0) {
        return null;
    }

    const userFavs = await getUserFavoriteIds();

    return (
        <ListingSlider 
            title={t.home.featured}
            listings={listings as Listing[]}
            userFavs={userFavs}
        />
    );
}
