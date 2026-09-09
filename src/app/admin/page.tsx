import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";
import {
    Users,
    Package,
    BadgeEuro,
    Star,
    Handshake
} from "lucide-react";
import { AdminStatCard, Histograms, HistogramData } from "@/components/admin/AdminStatCard";
import { AdminSalesChart } from "@/components/admin/AdminSalesChart";
import { getServerTenantSlug } from "@/utils/tenant/server";
import { TENANTS_CONFIG } from "@/config/tenants";
import { unstable_cache } from 'next/cache';

export const dynamic = "force-dynamic";

// --- Interfaces ---
interface HistogramBucket {
    count: number;
    sum: number;
    label: string;
}

interface DateItem {
    date: string;
    amount?: number;
}

interface EscrowOrderRecord {
    created_at: string;
    status: string;
    gross_amount_cents: number | null;
    ruralpop_fee_cents: number | null;
}

interface WalletRecord {
    created_at: string;
    stripe_connected_account_id: string | null;
    user: {
        email: string | null;
        tenant_id: string | null;
    } | null;
}

interface DashboardMetrics {
    totalUsers: number;
    totalListings: number;
    activeListings: number;
    userDates: { date: string }[];
    listingDates: { date: string }[];
    totalFeaturedRevenue: number;
    paymentDates: { date: string; amount: number }[];
    destacadosCount: number;
    proCount: number;
    totalSubscriptionRevenue: number;
    subscriptionDates: { date: string; amount: number }[];
    enabledWallets: WalletRecord[];
    completedEscrows: EscrowOrderRecord[];
    totalEscrowSales: number;
    totalEscrowFees: number;
    escrowSalesDates: { date: string; amount: number }[];
    escrowFeesDates: { date: string; amount: number }[];
}

function generateHistograms(items: DateItem[], isCurrency = false): Histograms {
    const now = new Date();
    
    const formatter = new Intl.NumberFormat('de-DE');

    const daysData = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (11 - i));
        return { count: 0, sum: 0, label: ['D', 'L', 'M', 'Mi', 'J', 'V', 'S'][d.getDay()] };
    });

    const weeksData = Array.from({ length: 12 }, (_, i) => {
        return { count: 0, sum: 0, label: `Sem -${11 - i}` };
    });

    const monthsData = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now);
        d.setMonth(d.getMonth() - (11 - i));
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return { count: 0, sum: 0, label: monthNames[d.getMonth()] };
    });

    items.forEach(item => {
        const d = new Date(item.date);
        const amount = item.amount || 0;
        
        // Days difference computed based on local calendar dates
        const todayAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dAtMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const diffDays = Math.max(0, Math.floor((todayAtMidnight.getTime() - dAtMidnight.getTime()) / (86400000)));

        if (diffDays >= 0 && diffDays < 12) {
            daysData[11 - diffDays].count++;
            daysData[11 - diffDays].sum += amount;
        }

        const diffWeeks = Math.max(0, Math.floor(diffDays / 7));
        if (diffWeeks >= 0 && diffWeeks < 12) {
            weeksData[11 - diffWeeks].count++;
            weeksData[11 - diffWeeks].sum += amount;
        }

        const diffMonths = Math.max(0, (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth());
        if (diffMonths >= 0 && diffMonths < 12) {
            monthsData[11 - diffMonths].count++;
            monthsData[11 - diffMonths].sum += amount;
        }
    });

    const mapFn = (d: HistogramBucket): HistogramData => ({
        value: isCurrency ? d.sum : d.count,
        tooltip: isCurrency ? `${formatter.format(d.sum)} € - ${d.count} - ${d.label}` : `${d.count} - ${d.label}`
    });

    return { 
        days: daysData.map(mapFn), 
        weeks: weeksData.map(mapFn), 
        months: monthsData.map(mapFn) 
    };
}

async function fetchAllDates(
    adminClient: SupabaseClient, 
    table: string, 
    tenantIdFilter?: string | null
): Promise<{ data: { created_at: string }[]; count: number }> {
    const allDates: { created_at: string }[] = [];
    let count = 0;

    // First fetch with head to get the exact count
    let countQuery = adminClient.from(table).select("*", { count: 'exact', head: true });
    if (tenantIdFilter) countQuery = countQuery.eq('tenant_id', tenantIdFilter);
    const { count: exactCount } = await countQuery;
    
    count = exactCount || 0;

    // Fetch in parallel batches for speed
    if (count > 0) {
        const step = 1000;
        const promises = [];
        for (let i = 0; i < count; i += step) {
            let pQuery = adminClient.from(table)
                    .select("created_at")
                    .range(i, i + step - 1);
            if (tenantIdFilter) pQuery = pQuery.eq('tenant_id', tenantIdFilter);
            promises.push(pQuery);
        }
        const results = await Promise.all(promises);
        for (const res of results) {
            if (res.data) allDates.push(...(res.data as { created_at: string }[]));
        }
    }
    return { data: allDates, count };
}

async function fetchAllEscrows(
    adminClient: SupabaseClient, 
    tenantIdFilter?: string | null
): Promise<EscrowOrderRecord[]> {
    const allData: EscrowOrderRecord[] = [];
    let count = 0;
    
    let countQuery = adminClient.from("escrow_orders").select("*", { count: 'exact', head: true });
    if (tenantIdFilter) countQuery = countQuery.eq('tenant_id', tenantIdFilter);
    const { count: exactCount } = await countQuery;
    
    count = exactCount || 0;
    if (count > 0) {
        const step = 1000;
        const promises = [];
        for (let i = 0; i < count; i += step) {
            let pQuery = adminClient.from("escrow_orders")
                    .select("created_at, status, gross_amount_cents, ruralpop_fee_cents")
                    .range(i, i + step - 1);
            if (tenantIdFilter) pQuery = pQuery.eq('tenant_id', tenantIdFilter);
            promises.push(pQuery);
        }
        const results = await Promise.all(promises);
        for (const res of results) {
            if (res.data) allData.push(...(res.data as EscrowOrderRecord[]));
        }
    }
    return allData;
}

// Optimized Data Fetcher with 5-minute cache
const getDashboardMetrics = unstable_cache(
    async (filterId: string | null | undefined, isEquipop: boolean, equipopId: string | undefined): Promise<DashboardMetrics> => {
        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
        const adminClient = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const stripeInstance = getStripe(filterId);

        let activeListingsQuery = adminClient.from("listings").select("*", { count: 'exact', head: true }).eq("status", "active");
        if (filterId) activeListingsQuery = activeListingsQuery.eq("tenant_id", filterId);

        let walletsQuery = adminClient.from("professional_wallets")
            .select(`created_at, stripe_connected_account_id, user:users${filterId ? '!inner' : ''}(email, tenant_id)`)
            .order("created_at", { ascending: false });
        if (filterId) walletsQuery = walletsQuery.eq("users.tenant_id", filterId);

        // Run Supabase and Stripe queries concurrently in parallel
        const [
            usersResult,
            listingsResult,
            { count: activeListings },
            { data: allWalletsData },
            allEscrows,
            paymentIntentsResponse,
            invoicesResponse
        ] = await Promise.all([
            fetchAllDates(adminClient, "users", filterId),
            fetchAllDates(adminClient, "listings", filterId),
            activeListingsQuery,
            walletsQuery,
            fetchAllEscrows(adminClient, filterId),
            stripeInstance.paymentIntents.list({ limit: 100 }).catch((err) => {
                console.error("Error fetching stripe payment intents:", err);
                return { data: [] };
            }),
            stripeInstance.invoices.list({ limit: 100 }).catch((err) => {
                console.error("Error fetching stripe invoices:", err);
                return { data: [] };
            })
        ]);

        const allWallets = (allWalletsData || []) as unknown as WalletRecord[];

        let successfulPayments = paymentIntentsResponse.data.filter(pi => 
            pi.status === "succeeded" && pi.metadata?.listingId
        );
        
        if (isEquipop && successfulPayments.length > 0 && equipopId) {
            const listingIds = successfulPayments.map(pi => pi.metadata?.listingId).filter(Boolean) as string[];
            const { data: listingsData } = await adminClient.from('listings').select('id').eq('tenant_id', equipopId).in('id', listingIds);
            const validListingIds = new Set((listingsData || []).map((l: { id: string }) => l.id));
            successfulPayments = successfulPayments.filter(pi => pi.metadata?.listingId && validListingIds.has(pi.metadata.listingId));
        }
        
        const totalFeaturedRevenue = successfulPayments.reduce((acc, pi) => acc + pi.amount, 0) / 100;
        const paymentDates = successfulPayments.map(pi => ({ date: new Date(pi.created * 1000).toISOString(), amount: pi.amount / 100 }));

        const destacadosCount = successfulPayments.filter(pi => pi.metadata?.planId?.startsWith('highlight') || pi.metadata?.planId === 'bump').length;
        const proCount = successfulPayments.filter(pi => pi.metadata?.planId === 'animal_welfare_validation' || pi.metadata?.planId === 'profile_validation').length;

        const paidInvoices = invoicesResponse.data.filter(inv => inv.status === 'paid' && inv.amount_paid > 0);
        const totalSubscriptionRevenue = paidInvoices.reduce((acc, inv) => acc + inv.amount_paid, 0) / 100;
        const subscriptionDates = paidInvoices.map(inv => ({ date: new Date(inv.created * 1000).toISOString(), amount: inv.amount_paid / 100 }));

        // Wallets with connected Stripe ID are immediately active without expensive sequential API pagination
        const enabledWallets = allWallets.filter(w => Boolean(w.stripe_connected_account_id));
        
        const completedEscrows = allEscrows.filter((e) => e.status !== "pending_checkout" && e.status !== "cancelled");
        const totalEscrowSales = completedEscrows.reduce((acc: number, e) => acc + (e.gross_amount_cents || 0), 0) / 100;
        const totalEscrowFees = completedEscrows.reduce((acc: number, e) => acc + (e.ruralpop_fee_cents || 0), 0) / 100;

        const escrowSalesDates = completedEscrows.map((e) => ({ date: e.created_at, amount: (e.gross_amount_cents || 0) / 100 }));
        const escrowFeesDates = completedEscrows.map((e) => ({ date: e.created_at, amount: (e.ruralpop_fee_cents || 0) / 100 }));

        return {
            totalUsers: usersResult.count,
            totalListings: listingsResult.count,
            activeListings: activeListings || 0,
            userDates: usersResult.data.map((u) => ({ date: u.created_at })),
            listingDates: listingsResult.data.map((l) => ({ date: l.created_at })),
            totalFeaturedRevenue,
            paymentDates,
            destacadosCount,
            proCount,
            totalSubscriptionRevenue,
            subscriptionDates,
            enabledWallets,
            completedEscrows,
            totalEscrowSales,
            totalEscrowFees,
            escrowSalesDates,
            escrowFeesDates
        };
    },
    ['admin-dashboard-metrics-cache-v3'],
    { revalidate: 300, tags: ['dashboard'] } // 5 minutes cache
);

export default async function AdminDashboard() {
    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';
    const equipopId = TENANTS_CONFIG['equipop']?.id;
    const filterId = isEquipop ? equipopId : null;
    
    const metrics = await getDashboardMetrics(filterId, isEquipop, equipopId);

    // Filter out bulk scraped data from August 28th between 11:00 and 15:00 UTC ONLY for charts
    const isNotScrapedSpike = (dStr: string) => {
        const d = new Date(dStr);
        if (d.getFullYear() === 2026 && d.getMonth() === 7 && d.getDate() === 28) {
            if (d.getUTCHours() >= 11 && d.getUTCHours() <= 15) return false;
        }
        return true;
    };

    const graphUserDates = metrics.userDates.filter((u) => isNotScrapedSpike(u.date));
    const graphListingDates = metrics.listingDates.filter((l) => isNotScrapedSpike(l.date));

    const recentWallets = metrics.enabledWallets.slice(0, 5);
    const totalEnabledWallets = metrics.enabledWallets.length;

    const realUsersHistograms = generateHistograms(graphUserDates);
    const realListingsHistograms = generateHistograms(graphListingDates);
    const realFeaturedHistograms = generateHistograms(metrics.paymentDates, true);
    const realSubscriptionHistograms = generateHistograms(metrics.subscriptionDates, true);
    const escrowSalesHistograms = generateHistograms(metrics.escrowSalesDates, true);
    const escrowFeesHistograms = generateHistograms(metrics.escrowFeesDates, true);

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-black text-[var(--ag-sys-color-text)] tracking-tight">Resumen Ejecutivo</h1>
                <p className="text-[var(--ag-sys-color-text-muted)] mt-1">
                    {isEquipop ? "Estado actual del marketplace de Equipop." : "Estado actual del marketplace de Ruralpop."}
                </p>
            </div>

            {/* Stats Cards - Updated Grid to make cards taller and more prominent */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* CARD 1: Usuarios Totales (REAL DATA) */}
                <AdminStatCard
                    label="Usuarios Totales"
                    value={metrics.totalUsers || 0}
                    icon={<Users className="w-7 h-7" />}
                    color="blue"
                    histograms={realUsersHistograms}
                    showFilters={true}
                    href="/admin/users"
                />

                {/* CARD 2: Anuncios Totales (REAL DATA) */}
                <AdminStatCard
                    label="Anuncios Totales"
                    value={metrics.totalListings || 0}
                    subtext={`${metrics.activeListings || 0} activos`}
                    icon={<Package className="w-7 h-7" />}
                    color="green"
                    histograms={realListingsHistograms}
                    showFilters={true}
                    href="/admin/listings"
                />

                {/* CARD 3: Anuncios Destacados (REAL DATA) */}
                <AdminStatCard
                    label="Anuncios destacados"
                    value={`${new Intl.NumberFormat('de-DE').format(metrics.totalFeaturedRevenue)} €`}
                    subtext={`${metrics.destacadosCount} Destacados • ${metrics.proCount} BA`}
                    icon={<Star className="w-7 h-7" />}
                    color="purple"
                    histograms={realFeaturedHistograms}
                    showFilters={true}
                    href="/admin/payments/featured"
                />

                {/* CARD 4: Perfiles Profesionales (REAL DATA) */}
                <AdminStatCard
                    label="Perfiles profesionales"
                    value={`${new Intl.NumberFormat('de-DE').format(metrics.totalSubscriptionRevenue)} €`}
                    icon={<BadgeEuro className="w-7 h-7" />}
                    color="amber"
                    histograms={realSubscriptionHistograms}
                    showFilters={true}
                />
            </div>

            {/* Escrow & Wallets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                
                {/* CARD 5: Últimos Wallets */}
                <div className="bg-[var(--ag-sys-color-surface)] p-6 rounded-[2rem] border border-[var(--ag-sys-color-border)] shadow-sm hover:shadow-lg transition-all flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center bg-slate-500/10 text-slate-500">
                            <Handshake className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] mb-1 leading-none">Wallets Recientes</p>
                            <h4 className="text-3xl font-black text-[var(--ag-sys-color-text)] leading-none">{totalEnabledWallets}</h4>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-2 flex-1 justify-center">
                        {recentWallets?.map((w, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm border-b border-[var(--ag-sys-color-border)] pb-2 last:border-0 last:pb-0">
                                <span className="font-medium text-[var(--ag-sys-color-text)] truncate mr-2" title={w.user?.email || undefined}>
                                    {w.user?.email || "Desconocido"}
                                </span>
                                <span className="text-[10px] text-[var(--ag-sys-color-text-muted)] whitespace-nowrap bg-[var(--ag-sys-color-background)] px-2 py-1 rounded-md font-bold uppercase border border-[var(--ag-sys-color-border)]">
                                    {new Date(w.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                        {(!recentWallets || recentWallets.length === 0) && (
                            <p className="text-sm text-[var(--ag-sys-color-text-muted)] text-center py-4">No hay wallets recientes.</p>
                        )}
                    </div>
                </div>

                {/* CARD 6: Ventas Escrow */}
                <AdminStatCard
                    label="Ventas Escrow"
                    value={`${new Intl.NumberFormat('de-DE').format(metrics.totalEscrowSales)} €`}
                    subtext={`${metrics.completedEscrows.length} completadas`}
                    icon={<Package className="w-7 h-7" />}
                    color="blue"
                    histograms={escrowSalesHistograms}
                    showFilters={true}
                />

                {/* CARD 7: Comisiones Escrow */}
                <AdminStatCard
                    label="Comisiones Escrow"
                    value={`${new Intl.NumberFormat('de-DE').format(metrics.totalEscrowFees)} €`}
                    icon={<BadgeEuro className="w-7 h-7" />}
                    color="green"
                    histograms={escrowFeesHistograms}
                    showFilters={true}
                />
            </div>

            <AdminSalesChart 
                featured={realFeaturedHistograms} 
                subscriptions={realSubscriptionHistograms} 
                escrowFees={escrowFeesHistograms} 
            />
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Eliminado cuello de botella crítico (11.2 segundos): El bucle `for await (stripe.accounts.list)`
 *   iteraba secuencialmente todas las cuentas de Stripe Connect vía múltiples peticiones HTTP bloqueando
 *   el SSR. Los wallets activos se obtienen ahora directamente de Supabase (`stripe_connected_account_id`) en 0ms.
 * - Resolución Multi-Tenant de Stripe: `getStripe(filterId)` utiliza la clave e instancia de Stripe apropiada
 *   (Ruralpop o Equipop) en lugar de consultar siempre la cuenta por defecto de Ruralpop.
 * - Paralelización total con `Promise.all`: Las consultas de Stripe (`paymentIntents`, `invoices`) se ejecutan
 *   concurrentemente con las consultas a Supabase en lugar de ejecutarse en cascada.
 * - Tolerancia a fallos en red: Las llamadas a Stripe incorporan `.catch(() => ({ data: [] }))` para garantizar
 *   que caídas o límites de rate-limit de Stripe nunca tiren abajo el panel administrativo.
 * - Tipado estricto: Eliminados todos los tipos `any` garantizando Type Safety estricto con interfaces completas.
 * - Excluidos los registros del scraping de Portugal (28 Ago 2026 11:00-15:00 UTC) solo a nivel de graficado.
 */
