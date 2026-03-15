import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency, formatRelativeTime } from "@/utils/format";
import { Tractor, MapPin, Tag, Clock } from "lucide-react";
import { DashboardListingActions } from "@/components/dashboard/DashboardListingActions";

export const dynamic = "force-dynamic";

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function DashboardPage(props: Props) {
    const searchParams = await props.searchParams;
    const currentTab = searchParams?.tab === "vendidos" ? "sold" : "active";

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: publicUser } = await supabase
        .from('users')
        .select(`role, available_bumps, available_featured`)
        .eq('id', user.id)
        .single();

    // Obtener anuncios del usuario actual filtrados por pestaña
    const { data: listings, error } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", currentTab)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching user listings:", error);
    }

    // Calculamos si tiene anuncios en total para ver si mostrar un empty state puro o tabs
    const { count: totalListingsCount } = await supabase
        .from("listings")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id);

    const hasAnyListing = totalListingsCount ? totalListingsCount > 0 : false;

    // Lógica para mensaje de éxito post-pago
    const isFeaturedSuccess = searchParams?.featured_success === "true";
    const isProActivationSuccess = searchParams?.success === "activated";
    const planId = searchParams?.plan_id as string | undefined;
    const listingIdForSuccess = searchParams?.listing_id as string | undefined;
    let successMessage = "";

    if (isProActivationSuccess) {
        successMessage = "¡Tu anuncio ha sido actualizado correctamente!";
    } else if (isFeaturedSuccess) {
        if (listingIdForSuccess) {
            // Obtenemos el título real directamente de la DB por si no estuviese en la lista actual
            const { data: featuredListing } = await supabase
                .from("listings")
                .select("title")
                .eq("id", listingIdForSuccess)
                .single();

            const listingTitle = featuredListing ? featuredListing.title : "tu anuncio";

            if (planId === "bump") {
                successMessage = `El anuncio '${listingTitle}' ya está en primera posición.`;
            } else if (planId === "highlight_7") {
                successMessage = `Tu anuncio '${listingTitle}' ya está destacado 7 días en primeras posiciones.`;
            } else if (planId === "highlight_20") {
                successMessage = `Tu anuncio '${listingTitle}' ya está destacado 20 días en primeras posiciones.`;
            } else {
                successMessage = `Tu anuncio '${listingTitle}' ha sido destacado correctamente.`;
            }
        } else {
            // Fallback genérico si faltan los parámetros en la URL (ej: caché o sesión antigua)
            successMessage = "Tu anuncio ha sido destacado correctamente.";
        }
    }

    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 w-full">
            <div className="container mx-auto px-4 max-w-6xl">
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">
                        Mi Panel
                    </h1>
                    <p className="text-[var(--ag-sys-color-text-muted)] mt-2 text-lg">
                        Gestiona tus anuncios publicados y su estado.
                    </p>
                </header>

                {(isFeaturedSuccess || isProActivationSuccess) && (
                    <div className="mb-8 p-5 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-green-100 p-2 rounded-full text-green-600 flex-shrink-0 mt-0.5">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-green-800 font-bold text-lg mb-1">¡Pago completado con éxito!</h3>
                            <p className="text-green-700">{successMessage}</p>
                        </div>
                    </div>
                )}

                {!hasAnyListing ? (
                    <div className="bg-[var(--ag-sys-color-surface)] rounded-[2rem] border border-[var(--ag-sys-color-border)] p-16 text-center shadow-sm mt-8">
                        <div className="mx-auto w-24 h-24 bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text-muted)] rounded-3xl flex items-center justify-center mb-6">
                            <Tractor className="w-12 h-12 opacity-20" />
                        </div>
                        <h3 className="text-2xl font-bold text-[var(--ag-sys-color-text)] mb-3">Aún no has publicado nada</h3>
                        <p className="text-[var(--ag-sys-color-text-muted)] mb-8 max-w-md mx-auto">
                            Empieza a vender tus productos, ganadería o maquinaria ahora mismo.
                        </p>
                        <Link
                            href="/upload"
                            className="inline-flex py-4 px-8 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-2xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-all shadow-lg shadow-[var(--ag-sys-color-primary)]/20"
                        >
                            Publicar primer anuncio
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Tabs */}
                        <div className="flex flex-wrap gap-3 mb-8">
                            <Link
                                href="/dashboard"
                                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${currentTab === 'active'
                                    ? 'bg-[var(--ag-sys-color-text)] text-[var(--ag-sys-color-background)]'
                                    : 'bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text-muted)] hover:bg-[var(--ag-sys-color-border)] border border-[var(--ag-sys-color-border)]'}`}
                            >
                                Activos
                            </Link>
                            <Link
                                href="/dashboard?tab=vendidos"
                                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${currentTab === 'sold'
                                    ? 'bg-[var(--ag-sys-color-text)] text-[var(--ag-sys-color-background)]'
                                    : 'bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text-muted)] hover:bg-[var(--ag-sys-color-border)] border border-[var(--ag-sys-color-border)]'}`}
                            >
                                Vendidos
                            </Link>
                        </div>

                        {/* List */}
                        {!listings || listings.length === 0 ? (
                            <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl border border-[var(--ag-sys-color-border)] p-12 text-center">
                                <p className="text-[var(--ag-sys-color-text-muted)] font-medium">
                                    {currentTab === 'sold' ? 'Aún no has marcado ningún anuncio como vendido.' : 'No tienes anuncios activos.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {listings?.map((listing: { id: string, title: string, price: number, image_urls: string[], status: string, location: string, category: string, created_at: string, sold_price?: number }) => (
                                    <div
                                        key={listing.id}
                                        className="bg-[var(--ag-sys-color-surface)] rounded-3xl border border-[var(--ag-sys-color-border)] overflow-hidden shadow-sm hover:shadow-md transition-all group"
                                    >
                                        <div className="flex flex-col sm:flex-row">
                                            {/* Thumbnail */}
                                            <div className="relative w-full sm:w-56 h-56 sm:h-auto overflow-hidden bg-[var(--ag-sys-color-background)] flex-shrink-0">
                                                {listing.image_urls?.[0] ? (
                                                    <Image
                                                        src={listing.image_urls[0]}
                                                        alt={listing.title}
                                                        fill
                                                        className={`object-cover transition-transform duration-500 ${currentTab === 'active' ? 'group-hover:scale-105' : 'grayscale opacity-80'}`}
                                                        sizes="(max-width: 640px) 100vw, 250px"
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
                                                    <div className="flex justify-between items-start gap-4 mb-2">
                                                        <h4 className="text-xl font-bold text-[var(--ag-sys-color-text)] line-clamp-2">
                                                            {listing.title}
                                                        </h4>
                                                        <div className="text-right flex-shrink-0">
                                                            {currentTab === 'sold' && listing.sold_price ? (
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-2xl font-black text-amber-600">
                                                                        {formatCurrency(listing.sold_price)}
                                                                    </span>
                                                                    <span className="text-sm font-medium text-[var(--ag-sys-color-text-muted)] line-through">
                                                                        {formatCurrency(listing.price)}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-2xl font-black text-[var(--ag-sys-color-primary)]">
                                                                    {formatCurrency(listing.price)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-[var(--ag-sys-color-text-muted)] mt-5">
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

                                                <DashboardListingActions 
                                                    listingId={listing.id} 
                                                    status={listing.status}
                                                    isProfesional={publicUser?.role === 'profesional'}
                                                    availableFeatured={publicUser?.available_featured || 0}
                                                    availableBumps={publicUser?.available_bumps || 0}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Filtramos por status: "active" o "sold" usando URL Params `?tab=vendidos`.
 * - "Zero Errors": En vez de `useState` en Server Component, delegamos el tab a URL searchParams.
 * - Soporte adaptativo para mostrar precio tachado en vendidos si existe `sold_price`.
 */
