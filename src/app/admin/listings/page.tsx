import { createClient } from "@/utils/supabase/server";
import { DeleteButton } from "./DeleteButton";

export const dynamic = "force-dynamic";

import {
    Package,
    MapPin,
    Tag,
    Eye,
    UserCheck,
    Edit,
    Heart
} from "lucide-react";
import Image from "next/image";
import SupabaseImage from "@/components/ui/SupabaseImage";
import { formatCurrency, formatRelativeTime } from "@/utils/format";
import { encodeId } from "@/utils/idUtils";
import Link from "next/link";

import { Pagination } from "@/components/ui/Pagination";

export default async function AdminListingsPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams;
    const supabase = await createClient();
    const PAGE_SIZE = 40;
    const currentPage = Number(searchParams.page) || 1;
    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
        .from("listings")
        .select("*, seller:users(*), favorites(count)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

    if (searchParams.userId && typeof searchParams.userId === 'string') {
        query = query.eq("user_id", searchParams.userId);
    }

    const { data: listings, error, count } = await query;

    if (error) {
        console.error("Error fetching listings:", error);
    }

    const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-[var(--ag-sys-color-text)] tracking-tight">Moderación de Anuncios</h1>
                    <p className="text-[var(--ag-sys-color-text-muted)] mt-1">Supervisión técnica de contenidos y reportes.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {listings?.map((l: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                    <div
                        key={l.id}
                        className="bg-[var(--ag-sys-color-surface)] rounded-3xl border border-[var(--ag-sys-color-border)] overflow-hidden shadow-sm hover:shadow-md transition-all group p-6"
                    >
                        <div className="flex flex-col lg:flex-row gap-8 items-start">
                            {/* Image and Status */}
                            <div className="relative w-full lg:w-48 aspect-square rounded-2xl overflow-hidden bg-[var(--ag-sys-color-background)] flex-shrink-0">
                                {l.image_urls?.[0] ? (
                                    <SupabaseImage src={l.image_urls[0]} alt={l.title} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[var(--ag-sys-color-text-muted)] opacity-20">
                                        <Package className="w-12 h-12" />
                                    </div>
                                )}
                                <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md ${l.status === 'active' ? 'bg-green-500/90 text-white' :
                                    l.status === 'moderated' ? 'bg-amber-500/90 text-white' :
                                        'bg-red-500/90 text-white'
                                    }`}>
                                    {l.status}
                                </div>
                            </div>

                            {/* Info Wrapper */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-black text-[var(--ag-sys-color-text)] line-clamp-1 mb-1">{l.title}</h3>
                                        <div className="flex items-center gap-3 text-xs text-[var(--ag-sys-color-text-muted)] font-bold">
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {l.location}</span>
                                            <span className="w-1 h-1 bg-[var(--ag-sys-color-border)] rounded-full"></span>
                                            <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {l.category}</span>
                                            <span className="w-1 h-1 bg-[var(--ag-sys-color-border)] rounded-full"></span>
                                            <span className="flex items-center gap-1 text-red-500"><Heart className="w-3 h-3 fill-current" /> {l.favorites?.[0]?.count || 0}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-[var(--ag-sys-color-primary)]">{formatCurrency(l.price)}</p>
                                        <span className="text-[10px] text-[var(--ag-sys-color-text-muted)] font-bold uppercase">{l.price_type}</span>
                                    </div>
                                </div>

                                <p className="text-sm text-[var(--ag-sys-color-text-muted)] line-clamp-2 mb-6">
                                    {l.description}
                                </p>

                                <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-[var(--ag-sys-color-border)]">
                                    {/* Seller Info */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] flex items-center justify-center text-[var(--ag-sys-color-primary)] overflow-hidden">
                                            {(l.seller as Record<string, string | null>)?.avatar_url ? <Image src={(l.seller as Record<string, string | null>).avatar_url as string} alt="" width={32} height={32} /> : <UserCheck className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[var(--ag-sys-color-text)] leading-none">{(l.seller as Record<string, string | null>)?.name || 'Vendedor'}</p>
                                            <span className="text-[10px] text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider font-bold">{formatRelativeTime(l.created_at)}</span>
                                        </div>
                                    </div>

                                    {/* Actions Moderation */}
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                        <Link href={`/admin/listings/edit/${encodeId(l.id)}`} className="flex items-center gap-2 px-4 py-2 bg-[var(--ag-sys-color-background)] text-xs font-bold text-[var(--ag-sys-color-primary)] border border-[var(--ag-sys-color-border)] rounded-xl hover:bg-[var(--ag-sys-color-border)] transition-all whitespace-nowrap">
                                            <Edit className="w-3.5 h-3.5" /> Editar
                                        </Link>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--ag-sys-color-background)] text-xs font-bold text-[var(--ag-sys-color-text)] border border-[var(--ag-sys-color-border)] rounded-xl hover:bg-[var(--ag-sys-color-border)] transition-all whitespace-nowrap">
                                            <Eye className="w-3.5 h-3.5" /> Ver
                                        </button>
                                        <DeleteButton listingId={l.id} title={l.title} />
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
