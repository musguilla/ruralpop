import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatRelativeTime } from "@/utils/format";
import { Wallet, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import { getStripe } from "@/lib/stripe";
import { EmbeddedWalletOnboarding } from "@/components/dashboard/EmbeddedWalletOnboarding";
import { ConfirmReturnButton } from "@/components/dashboard/ConfirmReturnButton";
import { getServerTenantSlug } from "@/utils/tenant/server";

import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function MonederoDashboardPage() {
    const tenant = await getServerTenantSlug();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const headersList = await headers();
    const locale = headersList.get('x-locale') || 'es';
    const isPt = locale === 'pt';

    if (!user) {
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
            const stripe = getStripe(tenant);
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
        .neq("status", "pending_checkout")
        .order("created_at", { ascending: false })
        .limit(10);

    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 w-full">
            <div className="container mx-auto px-4 max-w-6xl">
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">
                        {isPt ? "Carteira" : "Monedero"}
                    </h1>
                    <p className="text-[var(--ag-sys-color-text-muted)] mt-2 text-lg">
                        {isPt ? "Gira a sua carteira profissional e saldo disponível." : "Gestiona tu monedero profesional y saldo disponible."}
                    </p>
                </header>

                {!isStripeReady && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <Info className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-amber-900 text-lg">
                                    {isPt ? "Ainda não tem a sua carteira configurada" : "Aún no tienes configurado tu monedero"}
                                </h3>
                                <p className="text-amber-800/80 mt-1">
                                    {isPt 
                                        ? "Para poder receber pagamentos seguros e vender online, precisa de configurar a sua conta de cobranças no Stripe. É rápido e 100% seguro."
                                        : "Para poder recibir pagos seguros y vender online, necesitas configurar tu cuenta de cobros en Stripe. Es rápido y 100% seguro."}
                                </p>
                            </div>
                        </div>
                        <EmbeddedWalletOnboarding />
                    </div>
                )}

                {wallet && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                            {/* Card: Disponible */}
                            <div className="bg-[var(--ag-sys-color-primary)] text-white rounded-3xl p-6 shadow-md relative overflow-hidden group">
                                <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-20">
                                    <Wallet className="w-24 h-24" />
                                </div>
                                <h3 className="text-white/80 font-medium mb-1">
                                    {isPt ? "Saldo Disponível" : "Saldo Disponible"}
                                </h3>
                                <div className="text-4xl font-extrabold mb-4">
                                    {formatCurrency(wallet.available_balance_cents / 100)}
                                </div>
                                <div className="text-xs text-white/80 flex items-center gap-1">
                                    <ArrowUpRight className="w-3 h-3" /> 
                                    {isPt ? "Receberá os fundos em 7 dias no seu banco" : "Recibirás los fondos en 7 días en tu banco"}
                                </div>
                            </div>

                            {/* Card: Pendiente */}
                            <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl p-6 shadow-sm border border-[var(--ag-sys-color-border)]">
                                <h3 className="text-[var(--ag-sys-color-text-muted)] font-medium mb-1">
                                    {isPt ? "Saldo Retido" : "Saldo Retenido"}
                                </h3>
                                <div className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] mb-4">
                                    {formatCurrency(wallet.pending_balance_cents / 100)}
                                </div>
                                {wallet.pending_balance_cents > 0 && (
                                    <div className="text-xs text-amber-600 bg-amber-50 rounded-full px-2 py-1 inline-flex items-center gap-1">
                                        {isPt ? "A aguardar confirmação" : "Esperando confirmación"}
                                    </div>
                                )}
                            </div>

                            {/* Card: Total */}
                            <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl p-6 shadow-sm border border-[var(--ag-sys-color-border)]">
                                <h3 className="text-[var(--ag-sys-color-text-muted)] font-medium mb-1">
                                    {isPt ? "Total Recebido" : "Total Ingresado"}
                                </h3>
                                <div className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] mb-4">
                                    {formatCurrency(wallet.total_earned_cents / 100)}
                                </div>
                                <div className="text-xs text-[var(--ag-sys-color-text-muted)]">
                                    {isPt ? "Histórico de vendas" : "Histórico de ventas"}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-2xl font-bold text-[var(--ag-sys-color-text)]">
                                {isPt ? "Últimas operações" : "Últimas operaciones"}
                            </h2>
                            <Link href="/dashboard?tab=vendidos" className="text-sm font-bold text-[var(--ag-sys-color-primary)] hover:underline mb-1">
                                {isPt ? "Ver todas as vendas" : "Ver todas las ventas"}
                            </Link>
                        </div>

                        <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl border border-[var(--ag-sys-color-border)] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[var(--ag-sys-color-background)] border-b border-[var(--ag-sys-color-border)]">
                                            <th className="px-6 py-4 text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">
                                                {isPt ? "Data" : "Fecha"}
                                            </th>
                                            <th className="px-6 py-4 text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">
                                                {isPt ? "Anúncio" : "Anuncio"}
                                            </th>
                                            <th className="px-6 py-4 text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">
                                                {isPt ? "Valor" : "Importe"}
                                            </th>
                                            <th className="px-6 py-4 text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">
                                                {isPt ? "Estado" : "Estado"}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--ag-sys-color-border)]">
                                        {!orders || orders.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-[var(--ag-sys-color-text-muted)]">
                                                    {isPt ? "Ainda não existem operações registadas." : "No hay operaciones registradas todavía."}
                                                </td>
                                            </tr>
                                        ) : (
                                            orders.map((order: any) => (
                                                <tr key={order.id} className="hover:bg-[var(--ag-sys-color-background)]/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-[var(--ag-sys-color-text)]">
                                                        {formatRelativeTime(order.created_at, locale)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-[var(--ag-sys-color-text)] max-w-[200px] truncate">
                                                        {order.listings?.title || (isPt ? "Anúncio eliminado" : "Anuncio eliminado")}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-[var(--ag-sys-color-text)]">
                                                        {formatCurrency(order.seller_net_amount_cents / 100)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                            order.status === 'paid_held' ? 'bg-amber-100 text-amber-700' :
                                                            order.status === 'return_initiated' ? 'bg-red-100 text-red-700' :
                                                            order.status === 'refunded' ? 'bg-gray-100 text-gray-700' :
                                                            order.status === 'paid_out' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'buyer_confirmed' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {order.status === 'paid_held' ? (isPt ? 'Confirmação pendente' : 'Pendiente confirmación') :
                                                             order.status === 'return_initiated' ? (isPt ? 'Devolução iniciada pelo comprador' : 'Devolución iniciada por comprador') :
                                                             order.status === 'refunded' ? (isPt ? 'Reembolsado' : 'Reembolsado') :
                                                             order.status === 'buyer_confirmed' ? (isPt ? 'A libertar...' : 'Liberando...') :
                                                             order.status === 'paid_out' ? (isPt ? 'Libertado' : 'Liberado') :
                                                             order.status.replace("_", " ")}
                                                        </span>
                                                        {order.status === 'return_initiated' && (
                                                            <div className="mt-2">
                                                                <ConfirmReturnButton orderId={order.id} />
                                                            </div>
                                                        )}
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

/**
 * Memory / Decisiones Técnicas:
 * - Panel de Monedero / Carteira con soporte de internacionalización sensible a `locale === 'pt'`.
 * - Traducciones contextuales a portugués nativo de Portugal para saldos, alertas y tabla de operaciones.
 * - Cero regresiones en España (`ruralpop.com`).
 */
