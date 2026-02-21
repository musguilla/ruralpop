import { createClient } from "@/utils/supabase/server";
import {
    Users,
    Package,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertTriangle
} from "lucide-react";
import { formatCurrency } from "@/utils/format";

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch metrics (parallel for better performance)
    const [
        { count: totalUsers },
        { count: activeListings },
        { count: soldListings },
        { count: reportedListings }
    ] = await Promise.all([
        supabase.from("users").select("*", { count: 'exact', head: true }),
        supabase.from("listings").select("*", { count: 'exact', head: true }).eq("status", "active"),
        supabase.from("listings").select("*", { count: 'exact', head: true }).eq("status", "sold"),
        supabase.from("listings").select("*", { count: 'exact', head: true }).eq("status", "moderated")
    ]);

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-black text-[var(--ag-sys-color-text)] tracking-tight">Resumen Ejecutivo</h1>
                <p className="text-[var(--ag-sys-color-text-muted)] mt-1">Estado actual del marketplace de Ruralpop.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Usuarios Totales"
                    value={totalUsers || 0}
                    icon={<Users className="w-6 h-6" />}
                    color="blue"
                    trend="+12% este mes"
                />
                <StatCard
                    label="Anuncios Activos"
                    value={activeListings || 0}
                    icon={<Package className="w-6 h-6" />}
                    color="green"
                    trend="+5.4% este mes"
                />
                <StatCard
                    label="Operaciones Cerradas"
                    value={soldListings || 0}
                    icon={<CheckCircle2 className="w-6 h-6" />}
                    color="purple"
                    trend="+22% este mes"
                />
                <StatCard
                    label="Alertas/Moderación"
                    value={reportedListings || 0}
                    icon={<AlertTriangle className="w-6 h-6" />}
                    color="amber"
                    trend="-2% desde ayer"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
                {/* Recent Activity placeholder/chart area */}
                <div className="lg:col-span-2 bg-[var(--ag-sys-color-surface)] rounded-[2rem] border border-[var(--ag-sys-color-border)] p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-xl text-[var(--ag-sys-color-text)]">Ventas Recientes</h3>
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

function StatCard({ label, value, icon, color, trend }: { label: string; value: number | string; icon: React.ReactNode; color: string; trend: string }) {
    return (
        <div className="bg-[var(--ag-sys-color-surface)] p-6 rounded-[2rem] border border-[var(--ag-sys-color-border)] shadow-sm hover:shadow-lg hover:shadow-[var(--ag-sys-color-primary)]/5 transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                    color === 'green' ? 'bg-green-500/10 text-green-500' :
                        color === 'purple' ? 'bg-purple-500/10 text-purple-500' :
                            'bg-amber-500/10 text-amber-500'
                }`}>
                {icon}
            </div>
            <p className="text-sm font-bold text-[var(--ag-sys-color-text-muted)] mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <h4 className="text-3xl font-black text-[var(--ag-sys-color-text)]">{value}</h4>
                <span className="text-[10px] font-bold text-green-500">{trend}</span>
            </div>
        </div>
    );
}
