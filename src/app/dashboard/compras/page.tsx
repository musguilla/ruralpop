import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatRelativeTime } from "@/utils/format";
import { Package, CheckCircle2 } from "lucide-react";
import { ConfirmReceptionButton } from "@/components/dashboard/ConfirmReceptionButton";
import { InitiateReturnButton } from "@/components/dashboard/InitiateReturnButton";

export const dynamic = "force-dynamic";

export default async function ComprasDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/dashboard");
    }

    const { data: orders, error } = await supabase
        .from("escrow_orders")
        .select(`
            *,
            listings (title, image_urls)
        `)
        .eq("buyer_id", user.id)
        .neq("status", "pending_checkout")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching escrow orders:", error);
    }

    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 w-full">
            <div className="container mx-auto px-4 max-w-6xl">
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">
                        Mi Panel
                    </h1>
                    <p className="text-[var(--ag-sys-color-text-muted)] mt-2 text-lg">
                        Gestiona tus anuncios publicados y tus compras seguras.
                    </p>
                </header>

                {/* Tabs */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <Link
                        href="/dashboard"
                        className="px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text-muted)] hover:bg-[var(--ag-sys-color-border)] border border-[var(--ag-sys-color-border)]"
                    >
                        Activos
                    </Link>
                    <Link
                        href="/dashboard?tab=vendidos"
                        className="px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text-muted)] hover:bg-[var(--ag-sys-color-border)] border border-[var(--ag-sys-color-border)]"
                    >
                        Vendidos
                    </Link>
                    <Link
                        href="/dashboard/compras"
                        className="px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm bg-[var(--ag-sys-color-text)] text-[var(--ag-sys-color-background)]"
                    >
                        Compras
                    </Link>
                    <Link
                        href="/dashboard/monedero"
                        className="px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text-muted)] hover:bg-[var(--ag-sys-color-border)] border border-[var(--ag-sys-color-border)]"
                    >
                        Monedero
                    </Link>
                </div>

                {/* List */}
                {!orders || orders.length === 0 ? (
                    <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl border border-[var(--ag-sys-color-border)] p-12 text-center">
                        <div className="mx-auto w-24 h-24 bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text-muted)] rounded-3xl flex items-center justify-center mb-6">
                            <Package className="w-12 h-12 opacity-20" />
                        </div>
                        <p className="text-[var(--ag-sys-color-text-muted)] font-medium">
                            Aún no has realizado ninguna compra con pago seguro.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {orders.map((order: any) => {
                            const isPendingConfirmation = order.status === "paid_held" || order.status === "awaiting_delivery";
                            const isConfirmed = order.status === "buyer_confirmed" || order.status === "paid_out";
                            
                            return (
                                <div
                                    key={order.id}
                                    className="bg-[var(--ag-sys-color-surface)] rounded-3xl border border-[var(--ag-sys-color-border)] p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--ag-sys-color-text-muted)]">
                                                {formatRelativeTime(order.created_at)}
                                            </span>
                                            {isPendingConfirmation && (
                                                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                                    Pendiente confirmación
                                                </span>
                                            )}
                                            {isConfirmed && (
                                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Completado
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-[var(--ag-sys-color-text)] mb-1">
                                            {order.listings?.title || "Anuncio no disponible"}
                                        </h3>
                                        <div className="text-[var(--ag-sys-color-text-muted)] text-sm mb-4">
                                            Vendedor: {order.seller_email}
                                        </div>
                                        <div className="text-lg font-black text-[var(--ag-sys-color-primary)] flex items-center">
                                            <span className="text-[var(--ag-sys-color-text-muted)] font-normal text-sm mr-2 uppercase tracking-wider">Pagado:</span>
                                            {formatCurrency(order.gross_amount_cents / 100)}
                                        </div>
                                    </div>
                                    
                                    <div className="w-full md:w-auto flex flex-col gap-3">
                                        {isPendingConfirmation ? (
                                            <>
                                                <ConfirmReceptionButton orderId={order.id} />
                                                <InitiateReturnButton orderId={order.id} />
                                            </>
                                        ) : isConfirmed ? (
                                            <div className="text-sm text-green-600 font-bold bg-green-50 px-4 py-3 rounded-xl border border-green-100 flex items-center justify-center gap-2">
                                                <CheckCircle2 className="w-5 h-5" />
                                                Recepción Confirmada
                                            </div>
                                        ) : order.status === "return_initiated" ? (
                                            <div className="text-sm text-amber-700 font-bold bg-amber-50 px-4 py-3 rounded-xl border border-amber-100 flex items-center justify-center gap-2 text-center">
                                                Devolución en proceso
                                            </div>
                                        ) : order.status === "refunded" ? (
                                            <div className="text-sm text-gray-700 font-bold bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 flex items-center justify-center gap-2 text-center">
                                                Reembolsado
                                            </div>
                                        ) : (
                                            <div className="text-sm text-[var(--ag-sys-color-text-muted)] font-bold bg-[var(--ag-sys-color-background)] px-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] flex items-center justify-center text-center uppercase">
                                                {order.status.replace("_", " ")}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
