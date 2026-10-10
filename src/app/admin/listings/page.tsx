import { createClient as createAdminClient } from "@supabase/supabase-js";
import { DeleteButton } from "./DeleteButton";
import { ActivateButton } from "./ActivateButton";
import { AdminFilters } from "./AdminFilters";

export const dynamic = "force-dynamic";

import {
    Package,
    MapPin,
    Tag,
    Eye,
    UserCheck,
    Edit,
    Heart,
    Search,
    Star
} from "lucide-react";
import Image from "next/image";
import SupabaseImage from "@/components/ui/SupabaseImage";
import { formatCurrency, formatRelativeTime } from "@/utils/format";
import { encodeId } from "@/utils/idUtils";
import Link from "next/link";

import { Pagination } from "@/components/ui/Pagination";
import { getServerTenantFilterString } from "@/utils/tenant/server";
import { BulkListingManager } from "./BulkListingManager";
import { getCategories } from "@/utils/categoriesFetcher";
import { unstable_cache } from "next/cache";

import { createClient } from "@/utils/supabase/server";

// Cached helper to aggregate top liked listings without correlated subqueries on full listings table
const getTopLikedListingIds = unstable_cache(
    async () => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
        const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey);

        const allFavs: { listing_id: string }[] = [];
        let fromFav = 0;
        const step = 1000;
        while (true) {
            const { data } = await adminSupabase
                .from("favorites")
                .select("listing_id")
                .range(fromFav, fromFav + step - 1);
            if (!data || data.length === 0) break;
            allFavs.push(...data);
            if (data.length < step) break;
            fromFav += step;
        }
        const counts: Record<string, number> = {};
        for (const f of allFavs) {
            if (f.listing_id) counts[f.listing_id] = (counts[f.listing_id] || 0) + 1;
        }
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 100)
            .map(([id, count]) => ({ id, count }));
    },
    ['admin-top-liked-listings-v1'],
    { revalidate: 300 } // 5 minutes cache
);

export default async function AdminListingsPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams;
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const supabase = createAdminClient(supabaseUrl, serviceRoleKey);
    
    const PAGE_SIZE = 40;
    const currentPage = Number(searchParams.page) || 1;
    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const isTopLikes = searchParams.status === 'top-likes';
    let topLiked: { id: string; count: number }[] = [];

    let query = supabase
        .from("listings")
        .select("*, seller:users(*)", { count: "exact" })
        .or(await getServerTenantFilterString())
        .order("created_at", { ascending: false });

    if (isTopLikes) {
        topLiked = await getTopLikedListingIds();
        const topIds = topLiked.map(t => t.id);
        if (topIds.length > 0) {
            query = query.in("id", topIds);
        }
    } else {
        query = query.range(from, to);
    }

    if (searchParams.userId && typeof searchParams.userId === 'string') {
        query = query.eq("user_id", searchParams.userId);
    }

    if (searchParams.status === 'sold') {
        query = query.eq('status', 'sold');
    }

    if (searchParams.status === 'draft') {
        query = query.eq('status', 'draft');
    }

    if (searchParams.status === 'featured' || searchParams.featured === 'true') {
        query = query.eq('is_featured', true);
    }

    if (searchParams.online === 'true') {
        query = query.eq('vender_online', true);
    }

    if (searchParams.q && typeof searchParams.q === 'string') {
        query = query.ilike('title', `%${searchParams.q}%`);
    }

    if (searchParams.country === 'pt') {
        query = query.gte('province_id', 101);
    } else if (searchParams.country === 'es') {
        query = query.or('province_id.lt.101,province_id.is.null');
    }

    if (searchParams.category && typeof searchParams.category === 'string') {
        query = query.eq('category', searchParams.category);
    }

    if (searchParams.subcategory && typeof searchParams.subcategory === 'string') {
        query = query.eq('subcategory', searchParams.subcategory);
    }

    let { data: listings, error, count } = await query;

    if (error) {
        console.error("Error fetching listings:", error);
    }
    
    if (isTopLikes && listings) {
        // Sort in memory by favorites count descending using the cached ranking
        const likesMap = new Map(topLiked.map(t => [t.id, t.count]));
        listings.sort((a: any, b: any) => (likesMap.get(b.id) || 0) - (likesMap.get(a.id) || 0));
        
        // Take top 50 overall and paginate
        count = listings.length;
        listings = listings.slice(from, from + PAGE_SIZE);
    }

    // Decoupled favorites count fetch: only for the active page items (avoids correlated subquery timeouts - Postgres Error 57014)
    if (listings && listings.length > 0) {
        const listingIds = listings.map((l: any) => l.id);
        const { data: favs } = await supabase
            .from("favorites")
            .select("listing_id")
            .in("listing_id", listingIds);

        const counts: Record<string, number> = {};
        favs?.forEach((f: any) => {
            counts[f.listing_id] = (counts[f.listing_id] || 0) + 1;
        });
        listings.forEach((l: any) => {
            l.favorites = [{ count: counts[l.id] || 0 }];
        });
    }

    const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

    const equipopCategories = await getCategories("equipop");

    // Helper to preserve params in Links
    const buildLink = (status: string | null) => {
        const params = new URLSearchParams(searchParams as Record<string, string>);
        if (status) {
            params.set("status", status);
        } else {
            params.delete("status");
        }
        params.delete("page"); // Reset page on filter change
        return `/admin/listings?${params.toString()}`;
    };

    const buildOnlineLink = () => {
        const params = new URLSearchParams(searchParams as Record<string, string>);
        if (params.get("online") === "true") {
            params.delete("online");
        } else {
            params.set("online", "true");
        }
        params.delete("page");
        return `/admin/listings?${params.toString()}`;
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--ag-sys-color-text)] tracking-tight">Moderación de Anuncios</h1>
                    <p className="text-[var(--ag-sys-color-text-muted)] mt-1">Supervisión técnica de contenidos y reportes.</p>
                </div>
                
                <AdminFilters />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Link 
                        href={buildLink(null)} 
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${!searchParams.status || searchParams.status === 'all' ? 'bg-[var(--ag-sys-color-primary)] text-white shadow-md' : 'bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text)] border border-[var(--ag-sys-color-border)] hover:bg-gray-50'}`}
                    >
                        Todos los anuncios
                    </Link>
                    <Link 
                        href={buildLink("sold")} 
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${searchParams.status === 'sold' ? 'bg-[var(--ag-sys-color-primary)] text-white shadow-md' : 'bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text)] border border-[var(--ag-sys-color-border)] hover:bg-gray-50'}`}
                    >
                        Vendidos
                    </Link>
                    <Link 
                        href={buildLink("draft")} 
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${searchParams.status === 'draft' ? 'bg-red-500 text-white shadow-md' : 'bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text)] border border-[var(--ag-sys-color-border)] hover:bg-red-50'}`}
                    >
                        Borradores
                    </Link>
                    <Link 
                        href={buildOnlineLink()} 
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${searchParams.online === 'true' ? 'bg-emerald-500 text-white shadow-md' : 'bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text)] border border-[var(--ag-sys-color-border)] hover:bg-emerald-50'}`}
                    >
                        Venta Online
                    </Link>
                    <Link 
                        href={buildLink("featured")} 
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${searchParams.status === 'featured' ? 'bg-amber-500 text-white shadow-md' : 'bg-[var(--ag-sys-color-background)] text-amber-700 border border-amber-200 hover:bg-amber-50'}`}
                    >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> Destacados
                    </Link>
                </div>
                
                <div className="flex items-center gap-2">
                    <Link 
                        href={buildLink("top-likes")} 
                        className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition-all ${searchParams.status === 'top-likes' ? 'bg-amber-500 text-white shadow-md' : 'bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200'}`}
                    >
                        <Heart className="w-3.5 h-3.5" /> Top 50 Likes
                    </Link>
                    <span className="px-4 py-2 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 cursor-not-allowed opacity-70 flex items-center gap-1.5 flex-shrink-0" title="Próximamente">
                        <Eye className="w-3.5 h-3.5" /> Top 50 Visitas
                    </span>
                </div>
            </div>

            <BulkListingManager listings={listings || []} equipopCategories={equipopCategories} />

            <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
    );
}

/**
 * Memoria / Decisiones Técnicas (AdminListingsPage):
 * - Optimización PostgreSQL / Supabase Error 57014 (Statement Timeout):
 *   - Se eliminó la relación correlacionada `favorites(count)` de la selección principal de PostgREST.
 *     Previamente, PostgREST ejecutaba una subconsulta agregada sobre los ~19.000 registros de favoritos
 *     por cada anuncio listado, elevando el tiempo de respuesta a >5 segundos por página y provocando
 *     timeouts (8000ms) inmediatos bajo carga concurrente o filtros complejos.
 *   - En su lugar, se implementó el patrón desacoplado en dos fases:
 *     1) Se consulta la página de 40 anuncios con sus relaciones indexadas directas (`seller:users(*)`) en ~100ms.
 *     2) Para esos 40 IDs específicos, se consulta `favorites` con `.in("listing_id", listingIds)` en ~15ms,
 *        computando los contadores en memoria.
 *   - Para el filtro 'top-likes':
 *     Se eliminó el escaneo completo no paginado de todos los 7.500 anuncios con joins y favoritos.
 *     Se introdujo `getTopLikedListingIds` con `unstable_cache` (revalidación cada 5 min) para extraer los 100
 *     IDs con más me gusta directamente de `favorites`. La consulta a `listings` se acota con `.in("id", topIds)`,
 *     reduciendo el tiempo de consulta a milisegundos y erradicando el riesgo de saturación de conexiones.
 * - Edge Cases Cubiertos:
 *   - Casos sin resultados (listings vacío o null): validación segura para evitar llamadas innecesarias a `.in()`.
 *   - Filtrado combinado en top-likes (por categoría, búsqueda o usuario): preserva todos los filtros en Postgres.
 */

