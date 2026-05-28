import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { LocaleCode } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formatCurrency, formatRelativeTime } from "@/utils/format";
import { Tractor, MapPin, Tag, Clock } from "lucide-react";
import { DashboardListingActions } from "@/components/dashboard/DashboardListingActions";
import { UnifiedListingCard, UnifiedItem } from "@/components/dashboard/UnifiedListingCard";
import { getServerTenantFilterString } from "@/utils/tenant/server";

export const dynamic = "force-dynamic";

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function DashboardPage(props: Props) {
    const headersList = await headers();
    const locale = (headersList.get("x-locale") || "es") as LocaleCode;
    const dict = await getDictionary(locale);
    const searchParams = await props.searchParams;
    const currentTabRaw = searchParams?.tab;
    const currentTab = currentTabRaw === "vendidos" ? "sold" : currentTabRaw === "en_curso" ? "reserved" : "active";

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: publicUser } = await supabase
        .from('users')
        .select(`role, available_bumps, available_featured, is_ghost`)
        .eq('id', user.id)
        .single();

    if (publicUser?.is_ghost) {
        redirect("/profesionales?ghost_claim=true");
    }

    // Interfaces locales para tipado seguro
    interface DBListing {
        id: string;
        title: string;
        price: number;
        sold_price?: number;
        location: string;
        image_urls: string[];
        created_at: string;
        category: string;
        price_type: string;
        is_featured?: boolean;
        status: string;
        vender_online?: boolean;
        favorites: Array<{ count: number }>;
    }

    interface DBEscrowOrder {
        id: string;
        status: string;
        seller_net_amount_cents: number;
        listing_id: string;
        listings: DBListing;
        buyer: {
            email: string;
        };
        created_at: string;
        updated_at?: string;
    }

    // Obtener anuncios del usuario actual filtrados por pestaña
    const { data: listings, error } = await supabase
        .from("listings")
        .select("*, favorites(count)")
        .eq("user_id", user.id)
        .eq("status", currentTab)
        .or(await getServerTenantFilterString())
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching user listings:", error);
    }

    // Obtener operaciones de Escrow del usuario
    let escrowOrders: DBEscrowOrder[] = [];
    let inProgressEscrowListingIds: string[] = [];

    const { data: eo } = await supabase
        .from("escrow_orders")
        .select(`
            *,
            listings (*, favorites(count)),
            buyer:users!escrow_orders_buyer_id_fkey(email)
        `)
        .eq("seller_id", user.id)
        .neq("status", "pending_checkout")
        .order("created_at", { ascending: false });

    const rawEscrows = (eo as unknown as DBEscrowOrder[]) || [];

    if (currentTab === 'active') {
        const inProgressEscrows = rawEscrows.filter(
            (e) => e.status !== 'paid_out' && e.status !== 'refunded' && e.status !== 'cancelled'
        );
        inProgressEscrowListingIds = inProgressEscrows.map((e) => e.listing_id);
    } else if (currentTab === 'reserved') {
        escrowOrders = rawEscrows.filter(
            (e) => e.status !== 'paid_out' && e.status !== 'refunded' && e.status !== 'cancelled'
        );
    } else if (currentTab === 'sold') {
        escrowOrders = rawEscrows.filter(
            (e) => e.status === 'paid_out' || e.status === 'refunded' || e.status === 'cancelled'
        );
    }

    // Combinar y deduplicar
    let combinedItems: UnifiedItem[] = [];
    if (currentTab === 'active') {
        const filteredListings = (listings as unknown as DBListing[] || [])
            .filter((l) => !inProgressEscrowListingIds.includes(l.id));

        combinedItems = filteredListings.map((l) => ({
            type: 'active',
            data: l as any,
            date: new Date(l.created_at).getTime()
        }));
    } else {
        const escrowListingIds = new Set(escrowOrders.map((o) => o.listing_id));
        const manualListings = (listings as unknown as DBListing[] || [])
            .filter((l) => !escrowListingIds.has(l.id));

        const escrowItems: UnifiedItem[] = escrowOrders.map((o) => ({
            type: 'escrow',
            data: o as any,
            date: new Date(o.created_at).getTime()
        }));
        const manualItems: UnifiedItem[] = manualListings.map((l) => ({
            type: 'manual',
            data: l as any,
            date: new Date(l.created_at || l.created_at).getTime()
        }));

        // Orden cronológico (más recientes primero)
        combinedItems = [...escrowItems, ...manualItems].sort((a, b) => b.date - a.date);
    }

    // Calculamos si tiene anuncios en total para ver si mostrar un empty state puro o tabs
    const { count: totalListingsCount } = await supabase
        .from("listings")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id)
        .or(await getServerTenantFilterString());

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
                        Ventas
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
                                En venta
                            </Link>
                            <Link
                                href="/dashboard?tab=en_curso"
                                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${currentTab === 'reserved'
                                    ? 'bg-[var(--ag-sys-color-text)] text-[var(--ag-sys-color-background)]'
                                    : 'bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text-muted)] hover:bg-[var(--ag-sys-color-border)] border border-[var(--ag-sys-color-border)]'}`}
                            >
                                En curso
                            </Link>
                            <Link
                                href="/dashboard?tab=vendidos"
                                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${currentTab === 'sold'
                                    ? 'bg-[var(--ag-sys-color-text)] text-[var(--ag-sys-color-background)]'
                                    : 'bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text-muted)] hover:bg-[var(--ag-sys-color-border)] border border-[var(--ag-sys-color-border)]'}`}
                            >
                                Finalizadas
                            </Link>
                        </div>

                        {/* List */}
                        {!combinedItems || combinedItems.length === 0 ? (
                            <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl border border-[var(--ag-sys-color-border)] p-12 text-center">
                                <p className="text-[var(--ag-sys-color-text-muted)] font-medium">
                                    {currentTab === 'sold' 
                                        ? 'Aún no has marcado ningún anuncio como vendido.' 
                                        : currentTab === 'reserved'
                                        ? 'No tienes ventas en curso en este momento.'
                                        : dict.dashboard.empty_active}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {combinedItems.map((item, idx) => (
                                    <UnifiedListingCard 
                                        key={item.type === 'escrow' ? `escrow-${item.data.id}` : `listing-${item.data.id}`}
                                        item={item} 
                                        publicUser={publicUser} 
                                        currentTab={currentTab} 
                                    />
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
 * - Filtramos por status: "active" o "sold" usando URL Params `?tab=vendidos` para Finalizadas y `?tab=en_curso` para En curso.
 * - "Zero Errors": En vez de `useState` en Server Component, delegamos el tab a URL searchParams.
 * - Filtrado Dinámico de Escrow: Separamos los pedidos en custodia (Escrow) según su estado. Los pendientes
 *   de confirmación (no finalizados/no devueltos) se envían al tab 'reserved' (En curso). Los finalizados se envían al tab 'sold' (Finalizadas).
 * - Ocultación en Venta: Para evitar duplicados y listados incoherentes, los anuncios activos que tengan un pago en custodia activo
 *   se ocultan automáticamente del tab 'active' (En venta) y reaparecen únicamente si la transacción se cancela.
 * - Soporte adaptativo para mostrar precio tachado en vendidos si existe `sold_price`.
 */
