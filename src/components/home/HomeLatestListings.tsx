import React from 'react';
import { createClient } from "@/utils/supabase/server";
import { ListingCard, type Listing } from "@/components/ui/ListingCard";
import { getUserFavoriteIds } from "@/app/favoritos/actions";
import { getServerTenantFilterString } from "@/utils/tenant/server";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import { ArrowRight } from "lucide-react";

export async function HomeLatestListings() {
    const supabase = await createClient();
    const tenantFilterString = await getServerTenantFilterString();
    
    // Fetch latest active listings that have images
    let query = supabase
        .from("listings")
        .select(`
            id, title, price, location, image_urls, created_at, category, price_type, is_featured,
            users!inner(is_ghost)
        `)
        .eq("status", "active")
        .eq("users.is_ghost", false)
        .neq("image_urls", "{}") // Only listings with photos
        .order("created_at", { ascending: false })
        .limit(8);

    query = query.or(tenantFilterString);

    const { data: listings, error } = await query;

    if (error) {
        console.error("Error fetching latest listings:", error);
        return null;
    }

    if (!listings || listings.length === 0) {
        return null; // Silent skip if empty
    }

    const userFavs = await getUserFavoriteIds();

    return (
        <section className="my-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--ag-sys-color-text)] flex items-center justify-center sm:justify-start gap-2">
                    Últimos anuncios publicados
                </h2>
                <div className="flex justify-center sm:justify-end">
                    <LocalizedLink 
                        href="/?sort=recent" 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] hover:bg-[var(--ag-sys-color-primary)] hover:text-white rounded-full font-bold text-sm transition-all shadow-sm border border-[var(--ag-sys-color-primary)]/20"
                    >
                        Ver más
                        <ArrowRight className="w-4 h-4" />
                    </LocalizedLink>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((listing: any) => (
                    <ListingCard 
                        key={listing.id}
                        listing={listing as Listing} 
                        isFavorited={userFavs.includes(listing.id)} 
                    />
                ))}
            </div>

            {/* Documentación de memoria */}
            {/*
                * Decisiones Técnicas:
                * - Server component puro para SSR pre-renderizado del bloque de últimos anuncios.
                * - Se aplica un hard limit de 8 elementos de BD, filtrando "image_urls" para garantizar solo anuncios con fotos.
            */}
        </section>
    );
}
