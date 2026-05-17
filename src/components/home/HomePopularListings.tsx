import React from 'react';
import { createClient } from "@/utils/supabase/server";
import { ListingCard, type Listing } from "@/components/ui/ListingCard";
import { getUserFavoriteIds } from "@/app/favoritos/actions";
import { getServerTenantFilterString } from "@/utils/tenant/server";

export async function HomePopularListings() {
    const supabase = await createClient();
    const tenantFilterString = await getServerTenantFilterString();

    // Traemos un bloque generoso de listings con fotos y activos, junto a su conteo de favoritos
    // Limitamos a los 50 más recientes para no traer toda la base de datos a memoria
    let query = supabase
        .from("listings")
        .select(`
            id, title, price, location, image_urls, created_at, category, price_type, is_featured,
            users!inner(is_ghost),
            favorites(count)
        `)
        .eq("status", "active")
        .eq("users.is_ghost", false)
        .neq("image_urls", "{}")
        .order("created_at", { ascending: false });

    query = query.or(tenantFilterString);

    const { data: listings, error } = await query;

    if (error) {
        console.error("Error fetching popular listings:", error);
        return null;
    }

    if (!listings || listings.length === 0) {
        return null;
    }

    // Sort in memory by favorites count descending
    const sortedListings = [...listings].sort((a: any, b: any) => {
        const countA = a.favorites?.[0]?.count || 0;
        const countB = b.favorites?.[0]?.count || 0;
        return countB - countA;
    });

    // Filtramos para asegurar que tengan al menos 1 me gusta (opcional, pero asegura popularidad)
    // Si no hay con me gusta, cogemos los 8 con más (que serían 0, pero bueno)
    let topListings = sortedListings.filter((l: any) => (l.favorites?.[0]?.count || 0) > 0);
    
    // Si la BD es muy nueva y no hay likes, hacemos fallback a los normales para no dejar hueco
    if (topListings.length < 8) {
        topListings = sortedListings.slice(0, 8);
    } else {
        topListings = topListings.slice(0, 8);
    }

    const userFavs = await getUserFavoriteIds();

    return (
        <section className="my-16 pt-12 border-t border-[var(--ag-sys-color-border)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--ag-sys-color-text)] flex items-center justify-center sm:justify-start gap-2">
                    ❤️ A mucha gente le gustan
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {topListings.map((listing: any) => (
                    <div key={listing.id} className="h-[420px]">
                        <ListingCard 
                            listing={listing as Listing} 
                            isFavorited={userFavs.includes(listing.id)} 
                        />
                    </div>
                ))}
            </div>
            
            {/* Documentación de memoria */}
            {/*
                * Decisiones Técnicas:
                * - Para obtener los más populares sin una vista SQL o RPC, se piden los 100 anuncios con foto más recientes.
                * - Se hace el join `favorites(count)` que Supabase traduce en subquery.
                * - Se ordenan en memoria (Node.js/NextSSR) por la cantidad de likes y se extraen los top 8.
            */}
        </section>
    );
}
