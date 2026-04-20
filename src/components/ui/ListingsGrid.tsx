import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { Pagination } from "@/components/ui/Pagination";
import { ListingCard, type Listing } from "@/components/ui/ListingCard";
import { Tractor } from "lucide-react";
import { getUserFavoriteIds } from "@/app/favoritos/actions";
import { LOCATIONS } from "@/constants/locations";
import { AdSenseInFeed } from "@/components/ads/AdSenseInFeed";
import { AdSenseDisplaySidebar } from "@/components/ads/AdSenseDisplaySidebar";

export async function ListingsGrid({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    let supabase = await createClient();
    const PAGE_SIZE = 39;
    const currentPage = Number(searchParams.page) || 1;
    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const sortParam = searchParams.sort as string || "relevance";
    const userIdFilter = searchParams.user_id as string;
    const isGhostProfile = searchParams.is_ghost_profile === "true";

    // If it's a ghost profile we must bypass RLS to read 'sold' listings
    if (isGhostProfile) {
        supabase = createSupabaseAdmin(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
    }

    const buildQuery = (fallbackLevel = 0) => {
        let query = supabase
            .from("listings")
            .select(`
                id, title, price, location, image_urls, created_at, category, price_type, is_featured,
                users!inner(is_ghost)
            `, { count: "exact" })
            .order("is_featured", { ascending: false, nullsFirst: false });

        // Hide ghost listings globally UNLESS we are specifically fetching a user's listings
        if (!userIdFilter) {
            query = query.eq("status", "active").eq("users.is_ghost", false);
        } else {
            if (isGhostProfile) {
                query = query.in("status", ["active", "sold"]).eq("user_id", userIdFilter);
            } else {
                query = query.eq("status", "active").eq("user_id", userIdFilter);
            }
        }

        // Apply Sorting
        switch (sortParam) {
            case "cheap":
                query = query.order("price", { ascending: true });
                break;
            case "expensive":
                query = query.order("price", { ascending: false });
                break;
            case "recent":
            case "relevance":
            default:
                query = query.order("created_at", { ascending: false });
                break;
        }

        // Filter based on search params
        const categoryFilter = searchParams.category as string;
        if (categoryFilter && fallbackLevel < 4) {
            query = query.eq("category", categoryFilter);
        }

        const subcategoryFilter = searchParams.subcategory as string;
        if (subcategoryFilter && fallbackLevel < 3) {
            query = query.ilike("subcategory", subcategoryFilter);
        }

        const textQuery = searchParams.q as string;
        if (textQuery && fallbackLevel < 3) {
            let sanitizedQuery = textQuery.trim().toLowerCase();
            
            if (fallbackLevel === 2) {
                sanitizedQuery = sanitizedQuery.replace(/[aeiouáéíóúü]/gi, '_');
            }

            let queryTerms = sanitizedQuery.split(/[\s\-]+/).filter(t => t.length > 2);
            
            if (queryTerms.length <= 1) {
                query = query.or(`title.ilike.%${sanitizedQuery}%,description.ilike.%${sanitizedQuery}%,location.ilike.%${sanitizedQuery}%`);
            } else {
                if (fallbackLevel === 0) {
                    // AND Logic (default)
                    queryTerms.forEach(term => {
                        query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%`);
                    });
                } else {
                    // OR Logic Fallback (fallbackLevel 1 and 2)
                    const orConditions = queryTerms.map(term => `title.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%`).join(',');
                    query = query.or(orConditions);
                }
            }
        }

        const priceMin = searchParams.price_min as string;
        if (priceMin && fallbackLevel < 3) {
            query = query.gte("price", priceMin);
        }

        const priceMax = searchParams.price_max as string;
        if (priceMax && fallbackLevel < 3) {
            query = query.lte("price", priceMax);
        }

        const locationFilter = searchParams.province_id as string;
        if (locationFilter && fallbackLevel < 3) {
            if (locationFilter.startsWith('m')) {
                const muni = LOCATIONS.find((l: { id: string }) => l.id === locationFilter);
                if (muni) {
                    query = query.ilike("location", `%${muni.name}%`);
                } else {
                    const muniId = locationFilter.substring(1);
                    query = query.eq("municipality_id", muniId);
                }
            } else {
                query = query.eq("province_id", locationFilter);
            }
        }

        return query;
    };

    // Attempt primary strict AND search
    let query = buildQuery(0);
    let { data: listings, error, count } = await query.range(from, to);

    const isMultiWordSearch = typeof searchParams.q === 'string' && searchParams.q.trim().split(/[\s\-]+/).filter(t => t.length > 2).length > 1;

    let fallbackMessage = "";

    // Retry with OR fallback if needed
    if (!error && (!listings || listings.length === 0) && isMultiWordSearch) {
        query = buildQuery(1);
        const fallbackRes = await query.range(from, to);
        listings = fallbackRes.data;
        count = fallbackRes.count;
        error = fallbackRes.error;
    }

    // Ultra fallback: Retry with Accent/Vowel wildcards if still no results
    if (!error && (!listings || listings.length === 0) && typeof searchParams.q === 'string') {
        query = buildQuery(2);
        const wildcardRes = await query.range(from, to);
        listings = wildcardRes.data;
        count = wildcardRes.count;
        error = wildcardRes.error;
    }

    // SEO Fallback 1: Keep only Category, drop subcategory, search and location
    if (!error && (!listings || listings.length === 0) && searchParams.category) {
        query = buildQuery(3);
        const catRes = await query.range(from, to);
        listings = catRes.data;
        count = catRes.count;
        error = catRes.error;
        
        if (listings && listings.length > 0) {
             const catName = typeof searchParams.category === 'string' ? searchParams.category.charAt(0).toUpperCase() + searchParams.category.slice(1) : 'esta categoría';
             fallbackMessage = `No hay resultados exactos con esos filtros, pero aquí tienes los anuncios recientes de ${catName}.`;
        }
    }

    // SEO Fallback 2: Drop absolutely everything to prevent 0 results (Soft 404 Google warning)
    if (!error && (!listings || listings.length === 0)) {
        query = buildQuery(4);
        const globalRes = await query.range(from, to);
        listings = globalRes.data;
        count = globalRes.count;
        error = globalRes.error;
        
        if (listings && listings.length > 0) {
             fallbackMessage = `No hay resultados exactos, pero aquí tienes los anuncios más recientes de Ruralpop.`;
        }
    }

    if (error) {
        console.error("Supabase Error fetching listings:", error);
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-2xl border border-red-200">
                Error al cargar los anuncios. Inténtelo de nuevo más tarde.
            </div>
        );
    }

    if (!listings || listings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-16 text-center bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl">
                <Tractor className="w-16 h-16 text-[var(--ag-sys-color-border)] mb-4" />
                <h3 className="text-xl font-bold text-[var(--ag-sys-color-text)] mb-2">
                    No hay resultados
                </h3>
                <p className="text-[var(--ag-sys-color-text-muted)]">
                    No hemos encontrado ningún anuncio que coincida con tus filtros.
                </p>
            </div>
        );
    }

    const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

    const userFavs = await getUserFavoriteIds();

    // Determinar 4 posiciones para anuncios In-Feed basados en el número de página (para evitar problemas de hidratación)
    const adPositions = new Set<number>();
    const maxIndex = listings.length;
    if (maxIndex > 4) {
        adPositions.add((currentPage * 3) % maxIndex);
        adPositions.add((currentPage * 8 + 2) % maxIndex);
        adPositions.add((currentPage * 13 + 1) % maxIndex);
        adPositions.add((currentPage * 21 + 3) % maxIndex);
    } else if (maxIndex > 1) {
        adPositions.add(1);
    }

    const gridItems: React.ReactNode[] = [];
    listings.forEach((listing: Listing, index: number) => {
        if (adPositions.has(index)) {
            gridItems.push(<AdSenseInFeed key={`ad-${listing.id}-${index}`} />);
        }
        gridItems.push(
            <ListingCard key={listing.id} listing={listing} isFavorited={userFavs.includes(listing.id)} isGhostPreview={isGhostProfile} />
        );
    });

    return (
        <div className="flex flex-col xl:flex-row gap-8 items-start">
            <div className="flex-1 w-full max-w-full min-w-0">
                {fallbackMessage && (
                    <div className="mb-6 p-4 bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] border border-[var(--ag-sys-color-primary)]/20 rounded-xl font-medium text-center">
                        {fallbackMessage}
                    </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gridItems}
                </div>

                <Pagination currentPage={currentPage} totalPages={totalPages} />
            </div>

            <aside className="hidden xl:block w-[300px] flex-shrink-0 sticky top-24">
                <AdSenseDisplaySidebar />
            </aside>
        </div>
    );
}
