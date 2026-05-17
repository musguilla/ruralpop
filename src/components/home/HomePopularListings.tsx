import React from 'react';
import { createClient } from "@/utils/supabase/server";
import { ListingCard, type Listing } from "@/components/ui/ListingCard";
import { getUserFavoriteIds } from "@/app/favoritos/actions";
import { getServerTenantFilterString } from "@/utils/tenant/server";

export async function HomePopularListings() {
    const supabase = await createClient();
    const tenantFilterString = await getServerTenantFilterString();

    // 1. Obtener todos los favoritos para saber cuáles son los más populares reales
    // Usamos el cliente admin para asegurar que podemos ver todos los favoritos si hay RLS
    const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: allFavorites, error: favError } = await supabaseAdmin
        .from("favorites")
        .select("listing_id");

    if (favError || !allFavorites || allFavorites.length === 0) {
        return null;
    }

    // 2. Contar la popularidad de cada anuncio en memoria
    const favCounts: Record<string, number> = {};
    for (const fav of allFavorites) {
        favCounts[fav.listing_id] = (favCounts[fav.listing_id] || 0) + 1;
    }

    // 3. Obtener los IDs de los 30 anuncios con más me gusta (margen por si algunos están inactivos)
    const topListingIds = Object.entries(favCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30)
        .map(entry => entry[0]);

    if (topListingIds.length === 0) return null;

    // 4. Traer esos anuncios específicos desde la base de datos (aplicando filtros de fotos y estado)
    let query = supabase
        .from("listings")
        .select(`
            id, title, price, location, image_urls, created_at, category, price_type, is_featured,
            users!inner(is_ghost)
        `)
        .eq("status", "active")
        .eq("users.is_ghost", false)
        .neq("image_urls", "{}")
        .in("id", topListingIds);

    query = query.or(tenantFilterString);

    const { data: listings, error } = await query;

    if (error || !listings || listings.length === 0) {
        console.error("Error fetching popular listings:", error);
        return null;
    }

    // 5. Los resultados de 'in' no vienen ordenados, así que los ordenamos según nuestro ranking de favCounts
    const topListings = [...listings]
        .sort((a: any, b: any) => (favCounts[b.id] || 0) - (favCounts[a.id] || 0))
        .slice(0, 8); // Nos quedamos solo con los top 8 absolutos

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
                * - Para garantizar que mostramos los más populares reales, primero se hace un fetch a la tabla `favorites` y se cuenta la frecuencia.
                * - Una vez tenemos los IDs más populares, se pide solo esos anuncios a la tabla de listings filtrando los inactivos o sin foto.
                * - De esta forma no dependemos de un `.limit()` ciego que nos excluya anuncios antiguos con muchos me gusta.
            */}
        </section>
    );
}
