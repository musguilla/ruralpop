import { createClient } from "@/utils/supabase/server";
import stripe from "@/lib/stripe";
import {
    Users,
    Package,
    TrendingUp,
    BadgeEuro,
    Star,
    Handshake
} from "lucide-react";
import { AdminStatCard, Histograms } from "@/components/admin/AdminStatCard";
import { AdminSalesChart } from "@/components/admin/AdminSalesChart";
import { getServerTenantSlug } from "@/utils/tenant/server";
import { TENANTS_CONFIG } from "@/config/tenants";

export const dynamic = "force-dynamic";

function generateHistograms(items: { date: string, amount?: number }[], isCurrency = false) {
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

    const mapFn = (d: any) => ({
        value: isCurrency ? d.sum : d.count,
        tooltip: isCurrency ? `${formatter.format(d.sum)} € - ${d.count} - ${d.label}` : `${d.count} - ${d.label}`
    });

    return { 
        days: daysData.map(mapFn), 
        weeks: weeksData.map(mapFn), 
        months: monthsData.map(mapFn) 
    };
}

async function fetchAllDates(adminClient: any, table: string, tenantIdFilter?: string | null) {
    let allDates: any[] = [];
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
            if (res.data) allDates.push(...res.data);
        }
    }
    return { data: allDates, count };
}

async function fetchAllEscrows(adminClient: any, tenantIdFilter?: string | null) {
    let allData: any[] = [];
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
            if (res.data) allData.push(...res.data);
        }
    }
    return allData;
}

export default async function AdminDashboard() {
    const supabase = await createClient();
    
    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';
    const equipopId = TENANTS_CONFIG['equipop']?.id;
    const filterId = isEquipop ? equipopId : null;
    
    // Create an admin client to bypass RLS for accurate absolute counts across the database
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let activeListingsQuery = adminClient.from("listings").select("*", { count: 'exact', head: true }).eq("status", "active");
    if (filterId) activeListingsQuery = activeListingsQuery.eq("tenant_id", filterId);

    let walletsQuery = adminClient.from("professional_wallets")
        .select(`created_at, stripe_connected_account_id, user:users${filterId ? '!inner' : ''}(email, tenant_id)`)
        .order("created_at", { ascending: false });
    if (filterId) walletsQuery = walletsQuery.eq("users.tenant_id", filterId);

    // Fetch metrics and all creation dates to build histograms using the pagination helper
    const [
        usersResult,
        listingsResult,
        { count: activeListings },
        { data: allWallets },
        allEscrows
    ] = await Promise.all([
        fetchAllDates(adminClient, "users", filterId),
        fetchAllDates(adminClient, "listings", filterId),
        activeListingsQuery,
        walletsQuery,
        fetchAllEscrows(adminClient, filterId)
    ]);

    const totalUsers = usersResult.count;
    const totalListings = listingsResult.count;
    const userDates = usersResult.data.map((u: any) => ({ date: u.created_at }));
    const listingDates = listingsResult.data.map((l: any) => ({ date: l.created_at }));

    // Fetch real revenue data from Stripe (Anuncios Destacados)
    const paymentIntentsResponse = await stripe.paymentIntents.list({ limit: 100 });
    let successfulPayments = paymentIntentsResponse.data.filter(pi => 
        pi.status === "succeeded" && pi.metadata?.listingId
    );
    
    if (isEquipop && successfulPayments.length > 0) {
        const listingIds = successfulPayments.map(pi => pi.metadata?.listingId).filter(Boolean);
        const { data: listingsData } = await adminClient.from('listings').select('id').eq('tenant_id', equipopId).in('id', listingIds);
        const validListingIds = new Set(listingsData?.map((l: any) => l.id) || []);
        successfulPayments = successfulPayments.filter(pi => validListingIds.has(pi.metadata?.listingId));
    }
    
    const totalFeaturedRevenue = successfulPayments.reduce((acc, pi) => acc + pi.amount, 0) / 100;
    const paymentDates = successfulPayments.map(pi => ({ date: new Date(pi.created * 1000).toISOString(), amount: pi.amount / 100 }));

    // Fetch real subscription revenue data from Stripe (Perfiles Profesionales)
    const invoicesResponse = await stripe.invoices.list({ limit: 100 });
    let paidInvoices = invoicesResponse.data.filter((inv: any) => inv.status === "paid" && inv.subscription);
    
    if (isEquipop && paidInvoices.length > 0) {
        const customerIds = paidInvoices.map((inv: any) => inv.customer).filter(Boolean);
        const { data: usersData } = await adminClient.from('users').select('stripe_customer_id').eq('tenant_id', equipopId).in('stripe_customer_id', customerIds);
        const validCustomerIds = new Set(usersData?.map((u: any) => u.stripe_customer_id) || []);
        paidInvoices = paidInvoices.filter((inv: any) => validCustomerIds.has(inv.customer));
    }
    
    const totalSubscriptionRevenue = paidInvoices.reduce((acc, inv) => acc + inv.amount_paid, 0) / 100;
    const subscriptionDates = paidInvoices.map(inv => ({ date: new Date(inv.created * 1000).toISOString(), amount: inv.amount_paid / 100 }));

    // Compute enabled wallets
    const stripeAccounts = [];
    try {
        for await (const account of stripe.accounts.list({ limit: 100 })) {
            stripeAccounts.push(account);
        }
    } catch(e) {
        console.error("Error fetching stripe accounts", e);
    }
    const enabledAccountIds = new Set(
        stripeAccounts.filter(a => a.charges_enabled && a.details_submitted).map(a => a.id)
    );
    const enabledWallets = (allWallets || []).filter(w => enabledAccountIds.has(w.stripe_connected_account_id));
    const recentWallets = enabledWallets.slice(0, 5);
    const totalEnabledWallets = enabledWallets.length;

    const completedEscrows = allEscrows.filter((e: any) => e.status !== "pending_checkout" && e.status !== "cancelled");
    const totalEscrowSales = completedEscrows.reduce((acc: number, e: any) => acc + (e.gross_amount_cents || 0), 0) / 100;
    const totalEscrowFees = completedEscrows.reduce((acc: number, e: any) => acc + (e.ruralpop_fee_cents || 0), 0) / 100;

    const escrowSalesDates = completedEscrows.map((e: any) => ({ date: e.created_at, amount: (e.gross_amount_cents || 0) / 100 }));
    const escrowFeesDates = completedEscrows.map((e: any) => ({ date: e.created_at, amount: (e.ruralpop_fee_cents || 0) / 100 }));

    const realUsersHistograms = generateHistograms(userDates);
    const realListingsHistograms = generateHistograms(listingDates);
    const realFeaturedHistograms = generateHistograms(paymentDates, true);
    const realSubscriptionHistograms = generateHistograms(subscriptionDates, true);
    const escrowSalesHistograms = generateHistograms(escrowSalesDates, true);
    const escrowFeesHistograms = generateHistograms(escrowFeesDates, true);

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-black text-[var(--ag-sys-color-text)] tracking-tight">Resumen Ejecutivo</h1>
                <p className="text-[var(--ag-sys-color-text-muted)] mt-1">Estado actual del marketplace de Ruralpop.</p>
            </div>

            {/* Stats Cards - Updated Grid to make cards taller and more prominent */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* CARD 1: Usuarios Totales (REAL DATA) */}
                <AdminStatCard
                    label="Usuarios Totales"
                    value={totalUsers || 0}
                    icon={<Users className="w-7 h-7" />}
                    color="blue"
                    histograms={realUsersHistograms}
                    showFilters={true}
                />

                {/* CARD 2: Anuncios Totales (REAL DATA) */}
                <AdminStatCard
                    label="Anuncios Totales"
                    value={totalListings || 0}
                    subtext={`${activeListings || 0} activos`}
                    icon={<Package className="w-7 h-7" />}
                    color="green"
                    histograms={realListingsHistograms}
                    showFilters={true}
                />

                {/* CARD 3: Anuncios Destacados (REAL DATA) */}
                <AdminStatCard
                    label="Anuncios destacados"
                    value={`${new Intl.NumberFormat('de-DE').format(totalFeaturedRevenue)} €`}
                    icon={<Star className="w-7 h-7" />}
                    color="purple"
                    histograms={realFeaturedHistograms}
                    showFilters={true}
                />

                {/* CARD 4: Perfiles Profesionales (REAL DATA) */}
                <AdminStatCard
                    label="Perfiles profesionales"
                    value={`${new Intl.NumberFormat('de-DE').format(totalSubscriptionRevenue)} €`}
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
                        {recentWallets?.map((w: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm border-b border-[var(--ag-sys-color-border)] pb-2 last:border-0 last:pb-0">
                                <span className="font-medium text-[var(--ag-sys-color-text)] truncate mr-2" title={w.user?.email}>{w.user?.email || "Desconocido"}</span>
                                <span className="text-[10px] text-[var(--ag-sys-color-text-muted)] whitespace-nowrap bg-[var(--ag-sys-color-background)] px-2 py-1 rounded-md font-bold uppercase border border-[var(--ag-sys-color-border)]">{new Date(w.created_at).toLocaleDateString()}</span>
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
                    value={`${new Intl.NumberFormat('de-DE').format(totalEscrowSales)} €`}
                    subtext={`${completedEscrows.length} completadas`}
                    icon={<Package className="w-7 h-7" />}
                    color="blue"
                    histograms={escrowSalesHistograms}
                    showFilters={true}
                />

                {/* CARD 7: Comisiones Escrow */}
                <AdminStatCard
                    label="Comisiones Escrow"
                    value={`${new Intl.NumberFormat('de-DE').format(totalEscrowFees)} €`}
                    icon={<BadgeEuro className="w-7 h-7" />}
                    color="green"
                    histograms={escrowFeesHistograms}
                    showFilters={true}
                />
            </div>

            <AdminSalesChart featured={realFeaturedHistograms} subscriptions={realSubscriptionHistograms} escrowFees={escrowFeesHistograms} />
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Movido logic interactiva del AdminStatCard a un componente de cliente en @/components/admin/AdminStatCard.
 * - Recolección de fechas en el servidor para calcular histogramas reales para meses, semanas y días, evitando exponer IDs o Data sensible al cliente.
 * - Todos los cards tienen ahora la misma altura exacta como solicitó el usuario, eliminando el texto trend verde.
 */
