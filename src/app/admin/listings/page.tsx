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

    let query = supabase
        .from("listings")
        .select("*, seller:users(*), favorites(count)", { count: "exact" })
        .or(await getServerTenantFilterString())
        .order("created_at", { ascending: false })
        .range(from, to);

    if (searchParams.userId && typeof searchParams.userId === 'string') {
        query = query.eq("user_id", searchParams.userId);
    }

    if (searchParams.status === 'sold') {
        query = query.eq('status', 'sold');
    }

    if (searchParams.status === 'draft') {
        query = query.eq('status', 'draft');
    }

    if (searchParams.online === 'true') {
        query = query.eq('vender_online', true);
    }

    if (searchParams.q && typeof searchParams.q === 'string') {
        query = query.ilike('title', `%${searchParams.q}%`);
    }

    if (searchParams.category && typeof searchParams.category === 'string') {
        query = query.eq('category', searchParams.category);
    }

    if (searchParams.subcategory && typeof searchParams.subcategory === 'string') {
        query = query.eq('subcategory', searchParams.subcategory);
    }

    if (searchParams.status === 'top-likes') {
        // Remove range to get all available for JS sorting
        query = supabase
            .from("listings")
            .select("*, seller:users(*), favorites(count)", { count: "exact" })
            .or(await getServerTenantFilterString())
            .order("created_at", { ascending: false });
            
        if (searchParams.userId && typeof searchParams.userId === 'string') {
            query = query.eq("user_id", searchParams.userId);
        }

        if (searchParams.q && typeof searchParams.q === 'string') {
            query = query.ilike('title', `%${searchParams.q}%`);
        }

        if (searchParams.category && typeof searchParams.category === 'string') {
            query = query.eq('category', searchParams.category);
        }
        
        if (searchParams.subcategory && typeof searchParams.subcategory === 'string') {
            query = query.eq('subcategory', searchParams.subcategory);
        }
    }

    let { data: listings, error, count } = await query;

    if (error) {
        console.error("Error fetching listings:", error);
    }
    
    if (searchParams.status === 'top-likes' && listings) {
        // Sort in memory by favorites count descending
        listings.sort((a: any, b: any) => {
            const countA = a.favorites?.[0]?.count || 0;
            const countB = b.favorites?.[0]?.count || 0;
            return countB - countA;
        });
        
        // Take top 50 overall
        listings = listings.slice(0, 50);
        count = listings.length;
        
        // Apply pagination over the top 50
        listings = listings.slice(from, from + PAGE_SIZE);
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
