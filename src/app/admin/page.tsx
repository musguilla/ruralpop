import { createClient } from "@/utils/supabase/server";
import {
    Users,
    Package,
    TrendingUp,
    BadgeEuro,
    Star,
    Handshake
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch metrics (parallel for better performance)
    const [
        { count: totalUsers },
        { count: activeListings },
    ] = await Promise.all([
        supabase.from("users").select("*", { count: 'exact', head: true }),
        supabase.from("listings").select("*", { count: 'exact', head: true }).eq("status", "active"),
    ]);

    // Demo Data for charts
    const usersChartData = [20, 35, 25, 60, 45, 80, 55, 90, 70, 100, 85, 110];
    const listingsChartData = [15, 20, 25, 40, 35, 60, 50, 70, 80, 65, 90, 120];
    const featuredChartData = [10, 15, 12, 30, 20, 45, 30, 55, 60, 40, 70, 85];
    const salesChartData = [30, 45, 35, 70, 55, 90, 75, 110, 95, 130, 115, 150];

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-black text-[var(--ag-sys-color-text)] tracking-tight">Resumen Ejecutivo</h1>
                <p className="text-[var(--ag-sys-color-text-muted)] mt-1">Estado actual del marketplace de Ruralpop.</p>
            </div>

            {/* Stats Cards - Updated Grid to make cards taller and more prominent */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* CARD 1: Usuarios Totales */}
                <StatCard
                    label="Usuarios Totales"
                    value={totalUsers || 0}
                    icon={<Users className="w-7 h-7" />}
                    color="blue"
                    trend="+12% este mes"
                    chartData={usersChartData}
                    showFilters={true}
                />

                {/* CARD 2: Anuncios Activos */}
                <StatCard
                    label="Anuncios Activos"
                    value={activeListings || 0}
                    icon={<Package className="w-7 h-7" />}
                    color="green"
                    trend="+5.4% este mes"
                    chartData={listingsChartData}
                    showFilters={true}
                />

                {/* CARD 3: Anuncios Destacados */}
                <StatCard
                    label="Anuncios destacados"
                    value="1.450 €"
                    icon={<Star className="w-7 h-7" />}
                    color="purple"
                    trend="+22% este mes"
                    chartData={featuredChartData}
                    showFilters={true}
                />

                {/* CARD 4: Ventas y Comisiones */}
                <StatCard
                    label="Ventas y comisiones"
                    value="3.240 €"
                    icon={<BadgeEuro className="w-7 h-7" />}
                    color="amber"
                    trend="+8% este mes"
                    chartData={salesChartData}
                    showFilters={true}
                    customDemoContent={
                        <div className="flex flex-col gap-2 mt-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-[var(--ag-sys-color-text-muted)] font-medium">Comisiones Pendientes</span>
                                <span className="font-bold text-[var(--ag-sys-color-text)]">450 €</span>
                            </div>
                            <div className="w-full bg-[var(--ag-sys-color-background)] rounded-full h-1.5 mb-2">
                                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: "30%" }}></div>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-[var(--ag-sys-color-text-muted)] font-medium">Comisiones Cobradas</span>
                                <span className="font-bold text-[var(--ag-sys-color-text)]">2.790 €</span>
                            </div>
                            <div className="w-full bg-[var(--ag-sys-color-background)] rounded-full h-1.5">
                                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: "70%" }}></div>
                            </div>
                        </div>
                    }
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
                <div className="lg:col-span-2 bg-[var(--ag-sys-color-surface)] rounded-[2rem] border border-[var(--ag-sys-color-border)] p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-xl text-[var(--ag-sys-color-text)]">Evolución Global</h3>
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

                <div className="bg-[var(--ag-sys-color-surface)] rounded-[2rem] border border-[var(--ag-sys-color-border)] p-8 shadow-sm">
                    <h3 className="font-bold text-xl text-[var(--ag-sys-color-text)] mb-8">Últimos Registros</h3>
                    <div className="space-y-6">
                        {[1, 2, 3, 4, 5].map((u) => (
                            <div key={u} className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] flex items-center justify-center text-[var(--ag-sys-color-primary)]">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-[var(--ag-sys-color-text)] leading-tight">Usuario Rural #{u}</p>
                                    <span className="text-xs text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider font-bold">Salamanca</span>
                                </div>
                                <div className="text-xs font-bold text-green-500">Nuevo</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    icon,
    color,
    trend,
    chartData,
    showFilters,
    customDemoContent
}: {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    trend?: string;
    chartData?: number[];
    showFilters?: boolean;
    customDemoContent?: React.ReactNode;
}) {
    const colorMap = {
        blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', fill: 'bg-blue-500', activeFilter: 'bg-blue-500 text-white' },
        green: { bg: 'bg-green-500/10', text: 'text-green-500', fill: 'bg-green-500', activeFilter: 'bg-green-500 text-white' },
        purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', fill: 'bg-purple-500', activeFilter: 'bg-purple-500 text-white' },
        amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', fill: 'bg-amber-500', activeFilter: 'bg-amber-500 text-white' },
    };
    const colorClasses = colorMap[color as keyof typeof colorMap] || colorMap.blue;

    return (
        <div className="bg-[var(--ag-sys-color-surface)] p-6 rounded-[2rem] border border-[var(--ag-sys-color-border)] shadow-sm hover:shadow-lg hover:shadow-[var(--ag-sys-color-primary)]/5 transition-all flex flex-col h-full">

            {/* Header: Icono a la Izquierda y Titulo+Numero a la Derecha */}
            <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center ${colorClasses.bg} ${colorClasses.text}`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] mb-1 leading-none">{label}</p>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-3xl font-black text-[var(--ag-sys-color-text)] leading-none">{value}</h4>
                        {trend && <span className="text-[10px] font-bold text-green-500 whitespace-nowrap">{trend}</span>}
                    </div>
                </div>
            </div>

            {/* Area Inferior: Graficos y Filtros o Custom Content */}
            <div className="mt-auto pt-4 border-t border-[var(--ag-sys-color-border)] flex flex-col gap-4 flex-1 justify-end">

                {showFilters && (
                    <div className="flex gap-1.5 -mx-1">
                        <button className={`px-2.5 py-1 ${colorClasses.activeFilter} text-[9px] font-bold rounded-lg uppercase tracking-wider`}>Días</button>
                        <button className="px-2.5 py-1 bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text-muted)] hover:bg-[var(--ag-sys-color-surface)] text-[9px] font-bold rounded-lg uppercase tracking-wider transition-colors">Semanas</button>
                        <button className="px-2.5 py-1 bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text-muted)] hover:bg-[var(--ag-sys-color-surface)] text-[9px] font-bold rounded-lg uppercase tracking-wider transition-colors">Meses</button>
                    </div>
                )}

                {customDemoContent && (
                    <div className="w-full">
                        {customDemoContent}
                    </div>
                )}

                {chartData && (
                    <div className="h-16 flex items-end justify-between gap-[2px] w-full pt-2">
                        {chartData.map((h, i) => (
                            <div key={i} className="flex-1 w-full relative group h-full flex items-end">
                                <div
                                    className={`w-full rounded-t-sm transition-all cursor-pointer opacity-40 group-hover:opacity-100 ${colorClasses.fill}`}
                                    style={{ height: `${(h / Math.max(...chartData)) * 100}%` }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Rediseño de los 'StatCard' para ajustarse al requerimiento de alinear Icono a la izquierda y numero/titulo a la derecha.
 * - Integrados mini-gráficos hechos a mano con Tailwind (sin dependencias enormes tipo Recharts) escalados matemáticamente al alto de la base.
 * - Añadidos los 3 Badges de filtro UI.
 * - Flex h-full para asegurar que las cartas miden exactamente lo mismo independientemente del contenido o resoluciones raras.
 */
