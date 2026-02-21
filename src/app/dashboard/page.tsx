import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency, formatRelativeTime } from "@/utils/format";
import { Tractor, MapPin, Tag, Clock } from "lucide-react";
import { DashboardListingActions } from "@/components/dashboard/DashboardListingActions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Obtener anuncios del usuario
    const { data: listings, error } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching user listings:", error);
    }

    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 w-full">
            <div className="container mx-auto px-4 max-w-6xl">
                <header className="mb-10">
                    <h1 className="text-4xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">
                        Mi Panel
                    </h1>
                    <p className="text-[var(--ag-sys-color-text-muted)] mt-2 text-lg">
                        Gestiona tus anuncios publicados y su estado.
                    </p>
                </header>

                {!listings || listings.length === 0 ? (
                    <div className="bg-[var(--ag-sys-color-surface)] rounded-[2rem] border border-[var(--ag-sys-color-border)] p-16 text-center shadow-sm">
                        <div className="mx-auto w-24 h-24 bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text-muted)] rounded-3xl flex items-center justify-center mb-6">
                            <Tractor className="w-12 h-12 opacity-20" />
                        </div>
                        <h3 className="text-2xl font-bold text-[var(--ag-sys-color-text)] mb-3">Aún no has publicado nada</h3>
                        <p className="text-[var(--ag-sys-color-text-muted)] mb-8 max-w-md mx-auto">
                            Empieza a vender tus productos, animales o maquinaria ahora mismo.
                        </p>
                        <Link
                            href="/upload"
                            className="inline-flex py-4 px-8 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-2xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-all shadow-lg shadow-[var(--ag-sys-color-primary)]/20"
                        >
                            Publicar primer anuncio
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {listings?.map((listing: any) => (
                            <div
                                key={listing.id}
                                className="bg-[var(--ag-sys-color-surface)] rounded-3xl border border-[var(--ag-sys-color-border)] overflow-hidden shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex flex-col sm:flex-row">
                                    {/* Thumbnail */}
                                    <div className="relative w-full sm:w-48 h-48 sm:h-auto overflow-hidden bg-[var(--ag-sys-color-background)]">
                                        {listing.image_urls?.[0] ? (
                                            <Image
                                                src={listing.image_urls[0]}
                                                alt={listing.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 640px) 100vw, 200px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[var(--ag-sys-color-text-muted)]">
                                                <Tractor className="w-12 h-12 opacity-10" />
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${listing.status === 'active'
                                            ? 'bg-green-500/90 text-white'
                                            : 'bg-amber-500/90 text-white'
                                            }`}>
                                            {listing.status === 'active' ? 'Activo' : 'Vendido'}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-xl font-bold text-[var(--ag-sys-color-text)] line-clamp-1">
                                                    {listing.title}
                                                </h4>
                                                <span className="text-2xl font-black text-[var(--ag-sys-color-primary)]">
                                                    {formatCurrency(listing.price)}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-sm text-[var(--ag-sys-color-text-muted)] mt-4">
                                                <div className="flex items-center gap-1.5 bg-[var(--ag-sys-color-background)] px-3 py-1.5 rounded-full border border-[var(--ag-sys-color-border)]">
                                                    <MapPin className="w-4 h-4" />
                                                    {listing.location}
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-[var(--ag-sys-color-background)] px-3 py-1.5 rounded-full border border-[var(--ag-sys-color-border)]">
                                                    <Tag className="w-4 h-4" />
                                                    {listing.category}
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-[var(--ag-sys-color-background)] px-3 py-1.5 rounded-full border border-[var(--ag-sys-color-border)]">
                                                    <Clock className="w-4 h-4" />
                                                    {formatRelativeTime(listing.created_at)}
                                                </div>
                                            </div>
                                        </div>

                                        <DashboardListingActions listingId={listing.id} status={listing.status} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
