import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, TrendingUp, RefreshCw, CreditCard, ChevronRight, ShieldCheck, Zap, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProfessionalDashboardPage(props: Props) {
    const searchParams = await props.searchParams;
    const currentTab = searchParams?.tab === "suscripcion" ? "subscription" : "general";

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch user and check professional status
    const { data: publicUser } = await supabase
        .from('users')
        .select(`
            id, role, commercial_name, plan_type, available_bumps, available_featured, 
            plan_renews_at, stripe_customer_id, stripe_subscription_id
        `)
        .eq('id', user.id)
        .single();

    if (!publicUser || publicUser.role !== 'profesional') {
        redirect("/profesionales");
    }

    // Fetch some basic stats
    const { count: activeListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');
    
    const { count: totalListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    const isStartPlan = publicUser.plan_type === 'start';
    const isProPlan = publicUser.plan_type === 'pro';
    const portalUrl = "/api/create-portal-session";

    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 w-full">
            <div className="container mx-auto px-4 max-w-5xl">
                <header className="mb-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors mb-4 font-medium"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Volver al Panel Principal
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl hidden sm:flex">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight flex items-center gap-3">
                                    Panel Profesional
                                    <span className={`text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider ${isProPlan ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                                        PLAN {publicUser.plan_type?.toUpperCase() || 'START'}
                                    </span>
                                </h1>
                                <p className="text-[var(--ag-sys-color-text-muted)] mt-2 text-lg">
                                    Gestiona tus contactos, anuncios y promociones para acelerar tus ventas.
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Tabs Navigation */}
                <div className="flex gap-2 mb-10 p-1 bg-gray-100/50 w-fit rounded-2xl border border-gray-100">
                    <Link
                        href="/dashboard/pro"
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${currentTab === 'general'
                            ? 'bg-white text-[var(--ag-sys-color-text)] shadow-sm'
                            : 'text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]'}`}
                    >
                        General
                    </Link>
                    <Link
                        href="/dashboard/pro?tab=suscripcion"
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${currentTab === 'subscription'
                            ? 'bg-white text-[var(--ag-sys-color-text)] shadow-sm'
                            : 'text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]'}`}
                    >
                        Suscripción
                    </Link>
                </div>

                {currentTab === 'general' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-3 flex flex-col gap-8">
                            {/* Estadísticas */}
                            <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl border border-[var(--ag-sys-color-border)] shadow-sm p-6 sm:p-10">
                                <h2 className="text-xl font-bold text-[var(--ag-sys-color-text)] mb-8 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-[var(--ag-sys-color-primary)]" />
                                    Resumen del Negocio
                                </h2>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Anuncios Activos</h3>
                                        <div className="flex items-end gap-3">
                                            <span className="text-5xl font-black text-[var(--ag-sys-color-text)]">{activeListings || 0}</span>
                                            <span className="text-sm text-gray-400 mb-2 font-bold">/ {isStartPlan ? '15' : isProPlan ? '50' : '∞'}</span>
                                        </div>
                                        <Link 
                                            href={totalListings && totalListings > 0 ? "/dashboard" : "/upload"} 
                                            className="mt-6 inline-flex items-center gap-2 text-sm text-[var(--ag-sys-color-primary)] font-black hover:gap-3 transition-all"
                                        >
                                            {totalListings && totalListings > 0 ? "Gestionar inventario" : "Añade tu primer producto"}
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                    <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Anuncios Totales</h3>
                                        <div className="flex items-end gap-3">
                                            <span className="text-5xl font-black text-[var(--ag-sys-color-text)]">{totalListings || 0}</span>
                                            <span className="text-sm text-gray-400 mb-2 font-bold">históricos</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Herramientas de Promoción */}
                            <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl border border-[var(--ag-sys-color-border)] shadow-sm overflow-hidden">
                                <div className="p-8 border-b border-[var(--ag-sys-color-border)] bg-gradient-to-r from-green-50 to-emerald-50/20">
                                    <h2 className="text-xl font-bold text-green-800 mb-1 flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-green-600 fill-green-600" />
                                        Tus Promociones Mensuales
                                    </h2>
                                    <p className="text-sm text-green-700/70 font-medium">
                                        Beneficios incluidos para aumentar tu visibilidad. Se renuevan cada mes.
                                    </p>
                                </div>
                                
                                <div className="p-8 space-y-8">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 py-2">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
                                                <RefreshCw className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[var(--ag-sys-color-text)] text-xl">Impulsos para subir anuncio</h4>
                                                <p className="text-sm text-[var(--ag-sys-color-text-muted)] font-medium max-w-xs">Coloca tus anuncios de nuevo en las primeras páginas rápidamente.</p>
                                            </div>
                                        </div>
                                        <div className="bg-green-50 border border-green-100 rounded-2xl px-6 py-4 text-center min-w-[140px]">
                                            <div className="text-3xl font-black text-green-700">{publicUser.available_bumps || 0}</div>
                                            <div className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Disponibles</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 py-2">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                                                <ShieldCheck className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[var(--ag-sys-color-text)] text-xl">Anuncios Destacados</h4>
                                                <p className="text-sm text-[var(--ag-sys-color-text-muted)] font-medium max-w-xs">Tus anuncios en lugares preferentes de la categoría.</p>
                                            </div>
                                        </div>
                                        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-6 py-4 text-center min-w-[140px]">
                                            <div className="text-3xl font-black text-amber-700">{publicUser.available_featured || 0}</div>
                                            <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Disponibles</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-2xl">
                        <div className="bg-[var(--ag-sys-color-surface)] rounded-[2.5rem] border border-[var(--ag-sys-color-border)] shadow-xl overflow-hidden">
                            <div className="p-10 bg-[var(--ag-sys-color-primary)] text-white relative overflow-hidden">
                                <Building2 className="absolute -right-12 -bottom-12 w-48 h-48 text-white/10" />
                                <div className="relative z-10">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-green-200 mb-4 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" />
                                        Suscripción Activa
                                    </h3>
                                    <h2 className="text-5xl font-black mb-3 drop-shadow-md">Plan {publicUser.plan_type?.toUpperCase() || 'START'}</h2>
                                    <p className="text-green-100 font-bold text-lg">Facturación y gestión de cuenta profesional</p>
                                </div>
                            </div>
                            
                            <div className="p-10 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div>
                                        <div className="text-xs text-gray-400 font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-[var(--ag-sys-color-primary)]" />
                                            Próxima Factura
                                        </div>
                                        <div className="font-black text-2xl text-[var(--ag-sys-color-text)]">
                                            {publicUser.plan_renews_at ? new Date(publicUser.plan_renews_at).toLocaleDateString("es-ES", {
                                                year: "numeric", month: "long", day: "numeric"
                                            }) : "Pendiente"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <RefreshCw className="w-4 h-4 text-[var(--ag-sys-color-primary)]" />
                                            Ciclo de Renovación
                                        </div>
                                        <div className="font-black text-2xl text-[var(--ag-sys-color-text)]">
                                            Mensual
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-10 border-t border-gray-100">
                                    <form action={portalUrl} method="POST">
                                        <button 
                                            type="submit"
                                            className="w-full flex justify-between items-center py-6 px-8 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all group shadow-xl shadow-gray-200"
                                        >
                                            <span className="flex items-center gap-3">
                                                <CreditCard className="w-6 h-6 text-green-400" /> 
                                                Gestionar en Stripe
                                            </span>
                                            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </form>
                                    <p className="text-sm text-center text-gray-400 mt-6 font-medium leading-relaxed max-w-md mx-auto">
                                        Descarga tus facturas, actualiza tu tarjeta o cancela tu plan en el portal seguro de pagos.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se asume que el plan de base es "start" si por algún error guardan rol profesional pero no dictan el tipo.
 * - Usaremos el endpoint "/api/create-portal-session" (aún por implementar) para no ensuciar este SSR con llamadas pesadas a Stripe y gestionar la sesión on-demand.
 * - El diseño respira al emplear un look distinto si el usuario es START o PRO, aunque por ahora agrupa lógica (escalable modificando la comprobación 'isProPlan').
 */
