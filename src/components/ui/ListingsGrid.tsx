import { createClient } from "@/utils/supabase/server";
import { Pagination } from "@/components/ui/Pagination";
import { ListingCard, type Listing } from "@/components/ui/ListingCard";
import { Tractor } from "lucide-react";
import { getUserFavoriteIds } from "@/app/favoritos/actions";

export async function ListingsGrid({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const supabase = await createClient();
    const PAGE_SIZE = 40;
    const currentPage = Number(searchParams.page) || 1;
    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const sortParam = searchParams.sort as string || "relevance";

    let query = supabase
        .from("listings")
        .select("id, title, price, location, image_urls, created_at, category, price_type, is_featured", { count: "exact" })
        .eq("status", "active")
        .order("is_featured", { ascending: false, nullsFirst: false });

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
    if (categoryFilter) {
        query = query.eq("category", categoryFilter);
    }

    const subcategoryFilter = searchParams.subcategory as string;
    if (subcategoryFilter) {
        query = query.ilike("subcategory", subcategoryFilter);
    }

    const textQuery = searchParams.q as string;
    if (textQuery) {
        const queryTerm = textQuery.trim().toLowerCase();
        query = query.or(`title.ilike.%${queryTerm}%,description.ilike.%${queryTerm}%,location.ilike.%${queryTerm}%`);
    }

    const priceMin = searchParams.price_min as string;
    if (priceMin) {
        query = query.gte("price", priceMin);
    }

    const priceMax = searchParams.price_max as string;
    if (priceMax) {
        query = query.lte("price", priceMax);
    }

    const locationFilter = searchParams.province_id as string;
    if (locationFilter) {
        if (locationFilter.startsWith('m')) {
            // Find the location's real name from constants
            const muni = require("@/constants/locations").LOCATIONS.find((l: any) => l.id === locationFilter);
            if (muni) {
                // ILIKE on location column (e.g. location ilike '%Córdoba%')
                query = query.ilike("location", `%${muni.name}%`);
            } else {
                // Fallback to ID stripping just in case
                const muniId = locationFilter.substring(1);
                query = query.eq("municipality_id", muniId);
            }
        } else {
            query = query.eq("province_id", locationFilter);
        }
    }

    // Ejecutar query con rango para paginación
    const { data: listings, error, count } = await query.range(from, to);

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

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((listing: Listing) => (
                    <ListingCard key={listing.id} listing={listing} isFavorited={userFavs.includes(listing.id)} />
                ))}
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} />
        </>
    );
}
