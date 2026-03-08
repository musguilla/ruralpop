import { createClient } from "@/utils/supabase/server";
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

function generateHistograms(dates: string[]): Histograms {
    const now = new Date();

    // Arrays of size 12 filled with 0 (from newest [0] to oldest [11], but we map it so [11] is newest for visual consistency, actually let's just make [11] newest, [0] oldest)
    // Actually, visually: left is oldest, right is newest. So [11] is newest (now).
    const days = new Array(12).fill(0);
    const weeks = new Array(12).fill(0);
    const months = new Array(12).fill(0);

    dates.forEach(dateStr => {
        const d = new Date(dateStr);
        const diffTime = now.getTime() - d.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays < 12) {
            days[11 - diffDays]++;
        }

        const diffWeeks = Math.floor(diffDays / 7);
        if (diffWeeks >= 0 && diffWeeks < 12) {
            weeks[11 - diffWeeks]++;
        }

        const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth();
        if (diffMonths >= 0 && diffMonths < 12) {
            months[11 - diffMonths]++;
        }
    });

    return { days, weeks, months };
}

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch metrics and all creation dates to build histograms
    const [
        { data: usersData, count: totalUsers },
        { data: listingsData, count: activeListings },
    ] = await Promise.all([
        supabase.from("users").select("created_at", { count: 'exact' }),
        supabase.from("listings").select("created_at", { count: 'exact' }).eq("status", "active"),
    ]);

    const userDates = usersData?.map((u: any) => u.created_at) || [];
    const listingDates = listingsData?.map((l: any) => l.created_at) || [];

    const realUsersHistograms = generateHistograms(userDates);
    const realListingsHistograms = generateHistograms(listingDates);

    // Demo Data for charts 3 and 4
    const demoHistograms3: Histograms = {
        days: [10, 15, 12, 30, 20, 45, 30, 55, 60, 40, 70, 85],
        weeks: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
        months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    };

    const demoHistograms4: Histograms = {
        days: [30, 45, 35, 70, 55, 90, 75, 110, 95, 130, 115, 150],
        weeks: [20, 30, 25, 50, 40, 70, 60, 90, 80, 110, 100, 130],
        months: [10, 20, 15, 30, 25, 45, 35, 60, 50, 75, 65, 90]
    };

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

                {/* CARD 3: Anuncios Destacados (DEMO DATA) */}
                <AdminStatCard
                    label="Anuncios destacados"
                    value="1.450 €"
                    icon={<Star className="w-7 h-7" />}
                    color="purple"
                    histograms={demoHistograms3}
                    showFilters={true}
                />

                {/* CARD 4: Ventas y Comisiones (DEMO DATA) */}
                <AdminStatCard
                    label="Ventas y comisiones"
                    value="3.240 €"
                    icon={<BadgeEuro className="w-7 h-7" />}
                    color="amber"
                    histograms={demoHistograms4}
                    showFilters={true}
                />
            </div>

            <div className="pt-6">
                <div className="bg-[var(--ag-sys-color-surface)] rounded-[2rem] border border-[var(--ag-sys-color-border)] p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-xl text-[var(--ag-sys-color-text)]">Ventas totales</h3>
                        <button className="text-sm font-bold text-[var(--ag-sys-color-primary)] hover:underline">Ver Reporte</button>
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
