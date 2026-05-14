import { createClient as createAdminClient } from "@supabase/supabase-js";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Users, Package, Eye, DatabaseBackup } from "lucide-react";
import { InsightsPanels } from "@/components/admin/InsightsPanels";
import { RefreshInsightsButton } from "@/components/admin/RefreshInsightsButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function InsightsPage() {
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Intentamos descargar el JSON cacheado del bucket wpublic
    const { data: fileData, error: downloadError } = await supabaseAdmin
        .storage
        .from('wpublic')
        .download('admin-insights-cache.json');

    let insightsData = null;

    if (fileData && !downloadError) {
        try {
            const text = await fileData.text();
            insightsData = JSON.parse(text);
        } catch (e) {
            console.error("Error parsing insights JSON", e);
        }
    }

    if (!insightsData) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[var(--ag-sys-color-border)] pb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--ag-sys-color-text)]">Insights & KPIs</h1>
                        <p className="text-[var(--ag-sys-color-text-muted)] mt-1">Análisis premium de usuarios y anuncios.</p>
                    </div>
                    <RefreshInsightsButton />
                </div>

                <div className="flex flex-col items-center justify-center bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl p-12 shadow-sm text-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <DatabaseBackup className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--ag-sys-color-text)] mb-2">No hay datos generados</h2>
                    <p className="text-[var(--ag-sys-color-text-muted)] max-w-md mx-auto mb-6">
                        Para mantener la plataforma rápida, los datos de Insights no se calculan en tiempo real.
                        Haz clic en el botón superior para realizar el primer cálculo (puede tardar un minuto).
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[var(--ag-sys-color-border)] pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--ag-sys-color-text)]">Insights & KPIs</h1>
                    <p className="text-[var(--ag-sys-color-text-muted)] mt-1">Análisis premium de usuarios y anuncios.</p>
                </div>
                <RefreshInsightsButton lastUpdated={insightsData.last_updated} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AdminStatCard 
                    label="Usuarios Activos Hoy" 
                    value={insightsData.activeUsersTodayCount || 0} 
                    icon={<Users />} 
                    color="green" 
                />
                <AdminStatCard 
                    label="Anuncios Analizados" 
                    value={insightsData.totalAnalyzedListings || 0} 
                    icon={<Package />} 
                    color="purple" 
                />
                <AdminStatCard 
                    label="Tráfico Acumulado" 
                    value={insightsData.totalTraffic || 0} 
                    icon={<Eye />} 
                    color="blue" 
                />
            </div>

            <InsightsPanels 
                topProvinces={insightsData.topProvinces || []}
                topConnectedUsers={insightsData.topConnectedUsers || []}
                topUsersListings={insightsData.topUsersListings || []}
                topUsersChats={insightsData.topUsersChats || []}
                topVisitedListings={insightsData.topVisitedListings || []}
                topLikesListings={insightsData.topLikesListings || []}
                topListingsChats={insightsData.topListingsChats || []}
                topCategories={insightsData.topCategories || []}
            />
        </div>
    );
}
