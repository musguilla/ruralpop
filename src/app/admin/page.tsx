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

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch metrics and all creation dates to build histograms
    // We fetch more than the default 1000 limit (5000) to ensure we don't truncate histograms
    const [
        { data: usersData, count: totalUsers },
        { data: listingsData, count: activeListings },
    ] = await Promise.all([
        supabase.from("users").select("created_at", { count: 'exact' }).order('created_at', { ascending: false }).limit(5000),
        supabase.from("listings").select("created_at", { count: 'exact' }).eq("status", "active").order('created_at', { ascending: false }).limit(5000),
    ]);

    const userDates = usersData?.map((u: any) => ({ date: u.created_at })) || [];
    const listingDates = listingsData?.map((l: any) => ({ date: l.created_at })) || [];

    // Fetch real revenue data from Stripe (Anuncios Destacados)
    const paymentIntentsResponse = await stripe.paymentIntents.list({ limit: 100 });
    const successfulPayments = paymentIntentsResponse.data.filter(pi => 
        pi.status === "succeeded" && pi.metadata?.listingId
    );
    
    const totalFeaturedRevenue = successfulPayments.reduce((acc, pi) => acc + pi.amount, 0) / 100;
    const paymentDates = successfulPayments.map(pi => ({ date: new Date(pi.created * 1000).toISOString(), amount: pi.amount / 100 }));

    // Fetch real subscription revenue data from Stripe (Perfiles Profesionales)
    const invoicesResponse = await stripe.invoices.list({ limit: 100 });
    const paidInvoices = invoicesResponse.data.filter((inv: any) => inv.status === "paid" && inv.subscription);
    
    const totalSubscriptionRevenue = paidInvoices.reduce((acc, inv) => acc + inv.amount_paid, 0) / 100;
    const subscriptionDates = paidInvoices.map(inv => ({ date: new Date(inv.created * 1000).toISOString(), amount: inv.amount_paid / 100 }));

    const realUsersHistograms = generateHistograms(userDates);
    const realListingsHistograms = generateHistograms(listingDates);
    const realFeaturedHistograms = generateHistograms(paymentDates, true);
    const realSubscriptionHistograms = generateHistograms(subscriptionDates, true);

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

                {/* CARD 2: Anuncios Activos (REAL DATA) */}
                <AdminStatCard
                    label="Anuncios Activos"
                    value={activeListings || 0}
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

            <div className="pt-6">
                <div className="bg-[var(--ag-sys-color-surface)] rounded-[2rem] border border-[var(--ag-sys-color-border)] p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-xl text-[var(--ag-sys-color-text)]">Ventas totales</h3>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-4 px-4">
                        {[45, 60, 45, 80, 75, 40, 95].map((h, i) => (
                            <div key={i} className="flex-1 group relative">
                                <div
                                    className="w-full bg-[var(--ag-sys-color-primary)]/10 group-hover:bg-[var(--ag-sys-color-primary)]/20 rounded-t-lg transition-all cursor-pointer"
                                    style={{ height: `${h}%` }}
                                ></div>
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-[var(--ag-sys-color-text-muted)] font-bold">L-{i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Movido logic interactiva del AdminStatCard a un componente de cliente en @/components/admin/AdminStatCard.
 * - Recolección de fechas en el servidor para calcular histogramas reales para meses, semanas y días, evitando exponer IDs o Data sensible al cliente.
 * - Todos los cards tienen ahora la misma altura exacta como solicitó el usuario, eliminando el texto trend verde.
 */
