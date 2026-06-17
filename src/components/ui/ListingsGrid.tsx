import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { Pagination } from "@/components/ui/Pagination";
import { ListingCard, type Listing } from "@/components/ui/ListingCard";
import { Tractor } from "lucide-react";
import { getUserFavoriteIds } from "@/app/favoritos/actions";
import { LOCATIONS } from "@/constants/locations";
import { AdSenseInFeed } from "@/components/ads/AdSenseInFeed";
import { AdSenseDisplaySidebar } from "@/components/ads/AdSenseDisplaySidebar";
import { headers } from "next/headers";
import { LocaleCode } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getServerTenantFilterString, getServerTenantSlug } from "@/utils/tenant/server";
import { notFound } from "next/navigation";

export async function ListingsGrid({ searchParams, isHome = false, disableInFeedAds = false }: { searchParams: { [key: string]: string | string[] | undefined }, isHome?: boolean, disableInFeedAds?: boolean }) {
    let supabase = await createClient();
    const headersList = await headers();
    const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
    const dict = await getDictionary(locale);
    
    const t = (key: keyof typeof dict.search, params?: Record<string, string>): string => {
        let val = dict.search[key];
        if (typeof val === 'string' && params) {
            Object.keys(params).forEach(p => {
                val = val.replace(`{${p}}`, params[p]);
            });
        }
        return typeof val === 'string' ? val : String(key);
    };

    const PAGE_SIZE = isHome ? 43 : 40;
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

    // Obtenemos el filtro de tenant ANTES de construir el builder para no hacer async la función
    // y evitar que JavaScript resuelva prematuramente el Builder Thenable.
    const tenantFilterString = await getServerTenantFilterString();
    const tenantSlug = await getServerTenantSlug();
    const isEquipop = tenantSlug === 'equipop';

    const buildQuery = (fallbackLevel = 0) => {
        let query = supabase
            .from("listings")
            .select(`
                id, title, price, location, image_urls, created_at, category, price_type, is_featured,
                users!inner(is_ghost),
                favorites(count)
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

        // FASE 6: Multi-tenant filter
        query = query.or(tenantFilterString);

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
            let queryTerms = sanitizedQuery.split(/[\s\-]+/).filter(t => t.length > 2);
            
            // FASE 2: First word fallback
            if (fallbackLevel === 2 && queryTerms.length > 1) {
                queryTerms = [queryTerms[0]];
            }
            
            if (queryTerms.length <= 1) {
                const term = queryTerms[0] || sanitizedQuery;
                query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%,tags.cs.{"${term}"}`);
            } else {
                // AND Logic (default)
                const andConditions = queryTerms.map(term => `and(or(title.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%))`).join(',');
                query = query.or(`and(${andConditions}),tags.cs.{"${sanitizedQuery}"}`);
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
        if (locationFilter && fallbackLevel < 1) {
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

    // Fallback 1: Drop Location restriction (if there was one)
    if (!error && (!listings || listings.length === 0) && searchParams.province_id) {
        query = buildQuery(1);
        const fbRes = await query.range(from, to);
        listings = fbRes.data;
        count = fbRes.count;
        error = fbRes.error;
    }

    // Fallback 2: First word of multi-word search
    if (!error && (!listings || listings.length === 0) && isMultiWordSearch) {
        query = buildQuery(2);
        const wildcardRes = await query.range(from, to);
        listings = wildcardRes.data;
        count = wildcardRes.count;
        error = wildcardRes.error;
    }

    // SEO Fallback 3: Keep only Category, drop subcategory, search and location
    if (!error && (!listings || listings.length === 0) && searchParams.category) {
        query = buildQuery(3);
        const catRes = await query.range(from, to);
        listings = catRes.data;
        count = catRes.count;
        error = catRes.error;
    }

    // SEO Fallback 4: Drop absolutely everything to prevent 0 results (Soft 404 Google warning)
    if (!error && (!listings || listings.length === 0)) {
        query = buildQuery(4);
        const globalRes = await query.range(from, to);
        listings = globalRes.data;
        count = globalRes.count;
        error = globalRes.error;
    }

    // FASE 7: Rellenar la página con la misma categoría si hay pocos resultados (SEO UX Fill)
    // Solo en la página 1, y nunca dentro de los perfiles de usuario.
    if (!error && !userIdFilter && listings && listings.length > 0 && listings.length < PAGE_SIZE && currentPage === 1) {
        const fillCategory = listings[0].category;
        if (fillCategory) {
            const existingIds = listings.map((l: any) => l.id);
            const limit = PAGE_SIZE - listings.length;
            
            let fillQuery = supabase
                .from("listings")
                .select(`
                    id, title, price, location, image_urls, created_at, category, price_type, is_featured,
                    users!inner(is_ghost),
                    favorites(count)
                `)
                .eq("status", "active")
                .eq("users.is_ghost", false)
                .eq("category", fillCategory)
                .not("id", "in", `(${existingIds.join(',')})`)
                .order("is_featured", { ascending: false, nullsFirst: false })
                .order("created_at", { ascending: false })
                .limit(limit);

            fillQuery = fillQuery.or(tenantFilterString);
            
            const { data: fillData, error: fillError } = await fillQuery;
            if (!fillError && fillData && fillData.length > 0) {
                listings = [...listings, ...fillData];
                // No incrementamos 'count' para que la paginación no se rompa (totalPages seguirá siendo 1).
                // Esto es puramente un relleno visual para SEO y UX.
            }
        }
    }

    if (error) {
        console.error("Supabase Error fetching listings:", error);
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-2xl border border-red-200">
                {t("error_load")}
            </div>
        );
    }

    if (!listings || listings.length === 0) {
        if (currentPage > 1) {
            notFound();
        }

        return (
            <div className="flex flex-col items-center justify-center p-16 text-center bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl">
                {isEquipop ? (
                    <div className="relative w-32 h-24 mb-4 flex items-end justify-center overflow-hidden">
                        <style>{`
                            @keyframes horseJump {
                                0% { transform: translate(-40px, 10px) rotate(-15deg); opacity: 0; }
                                15% { opacity: 0.4; }
                                30% { transform: translate(-10px, -20px) rotate(-5deg); }
                                50% { transform: translate(5px, -25px) rotate(5deg); }
                                70% { transform: translate(20px, -10px) rotate(15deg); }
                                85% { opacity: 0.4; }
                                100% { transform: translate(50px, 15px) rotate(25deg); opacity: 0; }
                            }
                            .animate-horse-jump {
                                animation: horseJump 2.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
                            }
                        `}</style>
                        
                        {/* Obstáculo (Salto de competición) */}
                        <svg className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 text-[var(--ag-sys-color-border)] opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            {/* Postes */}
                            <path d="M6 22V8m12 14V8" />
                            {/* Barras horizontales */}
                            <path d="M4 12h16M4 16h16" />
                        </svg>

                        {/* Caballo animado utilizando imagen externa (equipop-empty.webp) */}
                        <img 
                            src="/equipop-empty.webp" 
                            alt="Caballo saltando" 
                            className="absolute animate-horse-jump w-16 h-16 object-contain"
                            style={{ filter: 'grayscale(100%)', mixBlendMode: 'multiply', opacity: 0.65 }}
                        />
                    </div>
                ) : (
                    <Tractor className="w-16 h-16 text-[var(--ag-sys-color-border)] mb-4" />
                )}
                <h3 className="text-xl font-bold text-[var(--ag-sys-color-text)] mb-2">
                    {t("no_resultados")}
                </h3>
                <p className="text-[var(--ag-sys-color-text-muted)]">
                    {t("no_anuncios_filtros")}
                </p>
            </div>
        );
    }

    const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

    const userFavs = await getUserFavoriteIds();

    // Determinar posiciones para anuncios In-Feed basados en el número de página
    const adPositions = new Set<number>();
    const maxIndex = listings.length;
    
    // Reglas de negocio: 
    // 1. Si hay menos de 12 anuncios, no mostramos anuncios intercalados.
    // 2. Los primeros 6 anuncios (índices 0-5) no deben tener publicidad.
    if (maxIndex >= 12) {
        const offset = 6;
        const availableSlots = maxIndex - offset;
        
        adPositions.add(offset + ((currentPage * 3) % availableSlots));
        adPositions.add(offset + ((currentPage * 8 + 2) % availableSlots));
        adPositions.add(offset + ((currentPage * 13 + 1) % availableSlots));
        adPositions.add(offset + ((currentPage * 21 + 3) % availableSlots));
        adPositions.add(offset + ((currentPage * 29 + 4) % availableSlots));
    }

    const gridItems: React.ReactNode[] = [];
    listings.forEach((listing: Listing, index: number) => {
        if (!disableInFeedAds && adPositions.has(index)) {
            gridItems.push(<AdSenseInFeed key={`ad-${listing.id}-${index}`} />);
        }
        gridItems.push(
            <ListingCard key={listing.id} listing={listing} isFavorited={userFavs.includes(listing.id)} isGhostPreview={isGhostProfile} />
        );
    });

    return isHome ? (
        <>
            {fallbackMessage && (
                <div className="mb-6 p-4 bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] border border-[var(--ag-sys-color-primary)]/20 rounded-xl font-medium text-center">
                    {fallbackMessage}
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {gridItems}
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} />
        </>
    ) : (
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
