import React from 'react';
import { createClient } from "@/utils/supabase/server";
import { ListingCard, type Listing } from "@/components/ui/ListingCard";
import { getUserFavoriteIds } from "@/app/favoritos/actions";
import { getServerTenantFilterString } from "@/utils/tenant/server";

export async function HomePopularListings() {
    const supabase = await createClient();
    const tenantFilterString = await getServerTenantFilterString();

    const tenantSlug = await getServerTenantFilterString();
    const isEquipop = tenantSlug.includes('equipop') || (await import('@/utils/tenant/server')).getServerTenantSlug().then(slug => slug === 'equipop');
    const cacheFileName = isEquipop ? 'admin-insights-cache-equipop.json' : 'admin-insights-cache.json';

    // 1. Obtener los IDs del caché global calculado por Insights (para evitar límite de 1000 de Supabase)
    const { data: cacheData, error: cacheError } = await supabase.storage
        .from('wpublic')
        .download(cacheFileName);

    if (cacheError || !cacheData) return null;

    const insightsStr = await cacheData.text();
    const insights = JSON.parse(insightsStr);

    if (!insights || !insights.topLikesListings || insights.topLikesListings.length === 0) {
        return null;
    }

    // 2. Extraer los IDs de los 30 anuncios más populares reales
    const topListingIds = insights.topLikesListings.slice(0, 30).map((l: any) => l.listing_id);

    if (topListingIds.length === 0) return null;

    // 3. Traer esos anuncios específicos desde la base de datos
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

    // 4. Ordenar exactamente igual que el ranking global de Insights
    const topListings = [...listings]
        .sort((a: any, b: any) => {
            const indexA = topListingIds.indexOf(a.id);
            const indexB = topListingIds.indexOf(b.id);
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        })
        .slice(0, 8);

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
