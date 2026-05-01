import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatRelativeTime } from "@/utils/format";
import { Wallet, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MonederoDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email?.toLowerCase().trim() !== "testpro@ruralpop.com") {
        redirect("/dashboard");
    }

    // Fetch Wallet
    const { data: wallet } = await supabase
        .from("professional_wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();

    // Check Stripe readiness
    let isStripeReady = false;
    if (wallet?.stripe_connected_account_id) {
        try {
            const stripe = (await import("@/lib/stripe")).default;
            const account = await stripe.accounts.retrieve(wallet.stripe_connected_account_id);
            isStripeReady = account.charges_enabled && account.details_submitted;
        } catch (e) {
            console.error("Error retrieving Stripe account:", e);
        }
    }

    // Fetch Escrow Orders for this seller
    const { data: orders } = await supabase
        .from("escrow_orders")
        .select(`
            *,
            listings (title)
        `)
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 w-full">
            <div className="container mx-auto px-4 max-w-6xl">
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">
                        Mi Panel
                    </h1>
                    <p className="text-[var(--ag-sys-color-text-muted)] mt-2 text-lg">
                        Gestiona tus anuncios publicados y tu monedero profesional.
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
                    {user.email?.toLowerCase().trim() === 'testpro@ruralpop.com' && (
                        <Link
                            href="/dashboard/compras"
                            className="px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text-muted)] hover:bg-[var(--ag-sys-color-border)] border border-[var(--ag-sys-color-border)]"
                        >
                            Compras Seguras
                        </Link>
                    )}
                    <Link
                        href="/dashboard/monedero"
                        className="px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm bg-[var(--ag-sys-color-text)] text-[var(--ag-sys-color-background)]"
                    >
                        Monedero
                    </Link>
                </div>

                {!isStripeReady && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <Info className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-amber-900 text-lg">Aún no tienes configurado tu monedero</h3>
                                <p className="text-amber-800/80 mt-1">
                                    Para poder recibir pagos seguros y vender online, necesitas configurar tu cuenta de cobros en Stripe. Es rápido y 100% seguro.
                                </p>
                            </div>
                        </div>
                        <form action={async () => {
                            "use server";
                            const { createStripeOnboardingLink } = await import("./actions");
                            const { url } = await createStripeOnboardingLink();
                            redirect(url);
                        }}>
                            <button type="submit" className="whitespace-nowrap px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-sm">
                                Configurar cobros seguros
                            </button>
                        </form>
                    </div>
                )}

                {wallet && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            {/* Card: Disponible */}
                            <div className="bg-[var(--ag-sys-color-primary)] text-white rounded-3xl p-6 shadow-md relative overflow-hidden group">
                                <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-20">
                                    <Wallet className="w-24 h-24" />
                                </div>
                                <h3 className="text-white/80 font-medium mb-1">Saldo Disponible</h3>
                                <div className="text-4xl font-extrabold mb-4">
                                    {formatCurrency(wallet.available_balance_cents / 100)}
                                </div>
                                <div className="text-xs text-white/80 flex items-center gap-1">
                                    <ArrowUpRight className="w-3 h-3" /> Transferible a tu banco
                                </div>
                            </div>

                            {/* Card: Pendiente */}
                            <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl p-6 shadow-sm border border-[var(--ag-sys-color-border)]">
                                <h3 className="text-[var(--ag-sys-color-text-muted)] font-medium mb-1">Saldo Retenido</h3>
                                <div className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] mb-4">
                                    {formatCurrency(wallet.pending_balance_cents / 100)}
                                </div>
                                <div className="text-xs text-amber-600 bg-amber-50 rounded-full px-2 py-1 inline-flex items-center gap-1">
                                    Esperando confirmación
                                </div>
                            </div>

                            {/* Card: Total */}
                            <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl p-6 shadow-sm border border-[var(--ag-sys-color-border)]">
                                <h3 className="text-[var(--ag-sys-color-text-muted)] font-medium mb-1">Total Ingresado</h3>
                                <div className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] mb-4">
                                    {formatCurrency(wallet.total_earned_cents / 100)}
                                </div>
                                <div className="text-xs text-[var(--ag-sys-color-text-muted)]">
                                    Histórico de ventas
                                </div>
                            </div>

                            {/* Card: Comisiones */}
                            <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl p-6 shadow-sm border border-[var(--ag-sys-color-border)]">
                                <h3 className="text-[var(--ag-sys-color-text-muted)] font-medium mb-1">Comisiones (Ruralpop)</h3>
                                <div className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] mb-4">
                                    {formatCurrency(wallet.total_fees_paid_cents / 100)}
                                </div>
                                <div className="text-xs text-[var(--ag-sys-color-text-muted)] flex items-center gap-1">
                                    <ArrowDownRight className="w-3 h-3 text-red-500" /> Pagadas
                                </div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-[var(--ag-sys-color-text)] mb-6">Últimas operaciones</h2>

                        <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl border border-[var(--ag-sys-color-border)] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[var(--ag-sys-color-background)] border-b border-[var(--ag-sys-color-border)]">
                                            <th className="px-6 py-4 text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Fecha</th>
                                            <th className="px-6 py-4 text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Anuncio</th>
                                            <th className="px-6 py-4 text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Importe Bruto</th>
                                            <th className="px-6 py-4 text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Comisión</th>
                                            <th className="px-6 py-4 text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Neto</th>
                                            <th className="px-6 py-4 text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--ag-sys-color-border)]">
                                        {!orders || orders.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-[var(--ag-sys-color-text-muted)]">
                                                    No hay operaciones registradas todavía.
                                                </td>
                                            </tr>
                                        ) : (
                                            orders.map((order: any) => (
                                                <tr key={order.id} className="hover:bg-[var(--ag-sys-color-background)]/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-[var(--ag-sys-color-text)]">
                                                        {formatRelativeTime(order.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-[var(--ag-sys-color-text)] max-w-[200px] truncate">
                                                        {order.listings?.title || "Anuncio eliminado"}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-[var(--ag-sys-color-text)]">
                                                        {formatCurrency(order.gross_amount_cents / 100)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-red-500 font-medium">
                                                        -{formatCurrency(order.ruralpop_fee_cents / 100)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-[var(--ag-sys-color-text)]">
                                                        {formatCurrency(order.seller_net_amount_cents / 100)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                            order.status === 'paid_held' ? 'bg-amber-100 text-amber-700' :
                                                            order.status === 'paid_out' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'buyer_confirmed' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {order.status === 'paid_held' ? 'Retenido' :
                                                             order.status === 'buyer_confirmed' ? 'Liberando...' :
                                                             order.status === 'paid_out' ? 'Liberado' :
                                                             order.status.replace("_", " ")}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
