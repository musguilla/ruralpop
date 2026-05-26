import { createClient as createAdminClient } from "@supabase/supabase-js";
import { DeleteButton } from "./DeleteButton";
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
    Search
} from "lucide-react";
import Image from "next/image";
import SupabaseImage from "@/components/ui/SupabaseImage";
import { formatCurrency, formatRelativeTime } from "@/utils/format";
import { encodeId } from "@/utils/idUtils";
import Link from "next/link";

import { Pagination } from "@/components/ui/Pagination";
import { getServerTenantFilterString } from "@/utils/tenant/server";

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

            <div className="flex flex-col gap-3">
                {listings?.map((l: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                    <div
                        key={l.id}
                        className="bg-[var(--ag-sys-color-surface)] rounded-2xl border border-[var(--ag-sys-color-border)] shadow-sm hover:shadow-md transition-all group p-3 sm:p-4"
                    >
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            {/* Image and Status */}
                            <div className="relative w-full sm:w-24 sm:h-24 aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden bg-[var(--ag-sys-color-background)] flex-shrink-0">
                                {l.image_urls?.[0] ? (
                                    <SupabaseImage src={l.image_urls[0]} alt={l.title} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[var(--ag-sys-color-text-muted)] opacity-20">
                                        <Package className="w-8 h-8" />
                                    </div>
                                )}
                                <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider backdrop-blur-md ${l.status === 'active' ? 'bg-green-500/90 text-white' :
                                    l.status === 'moderated' ? 'bg-amber-500/90 text-white' :
                                        'bg-red-500/90 text-white'
                                    }`}>
                                    {l.status}
                                </div>
                                {l.vender_online && (
                                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider backdrop-blur-md bg-emerald-500/90 text-white">
                                        Online
                                    </div>
                                )}
                            </div>

                            {/* Info Wrapper */}
                            <div className="flex-1 min-w-0 w-full flex flex-col md:flex-row gap-4 md:items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h3 className="text-base font-black text-[var(--ag-sys-color-text)] line-clamp-1">{l.title}</h3>
                                        <span className="text-base font-black text-[var(--ag-sys-color-primary)]">{formatCurrency(l.price)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-[var(--ag-sys-color-text-muted)] font-bold flex-wrap">
                                        <span className="flex items-center gap-1 whitespace-nowrap"><MapPin className="w-3 h-3" /> {l.location}</span>
                                        <span className="w-1 h-1 bg-[var(--ag-sys-color-border)] rounded-full flex-shrink-0"></span>
                                        <span className="flex items-center gap-1 whitespace-nowrap"><Tag className="w-3 h-3" /> {l.category}{l.subcategory ? ` > ${l.subcategory}` : ''}</span>
                                        <span className="w-1 h-1 bg-[var(--ag-sys-color-border)] rounded-full flex-shrink-0"></span>
                                        <span className="flex items-center gap-1 text-red-500 whitespace-nowrap"><Heart className="w-3 h-3 fill-current" /> {l.favorites?.[0]?.count || 0}</span>
                                    </div>
                                </div>

                                {/* Seller Info & Actions */}
                                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] flex items-center justify-center text-[var(--ag-sys-color-primary)] overflow-hidden flex-shrink-0">
                                            {(l.seller as Record<string, string | null>)?.avatar_url ? <Image src={(l.seller as Record<string, string | null>).avatar_url as string} alt="" width={24} height={24} /> : <UserCheck className="w-3 h-3" />}
                                        </div>
                                        <div className="hidden md:block">
                                            <p className="text-[10px] font-bold text-[var(--ag-sys-color-text)] leading-none mb-0.5 truncate max-w-[100px]">{(l.seller as Record<string, string | null>)?.name || 'Vendedor'}</p>
                                            <span className="text-[9px] text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider font-bold">{formatRelativeTime(l.created_at)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1.5">
                                        <Link href={`/admin/listings/edit/${encodeId(l.id)}`} title="Editar anuncio" className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 border border-blue-100 rounded-full hover:bg-blue-100 transition-all">
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <Link href={`/anuncio/${l.slug || 'anuncio-' + encodeId(l.id)}`} target="_blank" title="Ver anuncio" className="flex items-center justify-center w-8 h-8 bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text)] border border-[var(--ag-sys-color-border)] rounded-full hover:bg-[var(--ag-sys-color-border)] transition-all">
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <DeleteButton listingId={l.id} title={l.title} sellerEmail={(l.seller as Record<string, string | null>)?.email || undefined} iconOnly={true} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
    );
}
