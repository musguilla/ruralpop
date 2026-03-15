import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, TrendingUp, RefreshCw, CreditCard, ChevronRight, ShieldCheck, Zap, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfessionalDashboardPage() {
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
        // Redirigir a landing de ventas o dashboard normal si no es pro
        redirect("/profesionales");
    }

    // Fetch some basic stats: active listings vs total
    const { count: activeListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');
    
    // Total listings (any status)
    const { count: totalListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    const isStartPlan = publicUser.plan_type === 'start';
    const isProPlan = publicUser.plan_type === 'pro';

    // Mock Customer Portal URL generator logic - In a real app we'd redirect to an api route that calls `stripe.billingPortal.sessions.create`
    const portalUrl = "/api/create-portal-session"; // Needs to be implemented yet

    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 w-full">
            <div className="container mx-auto px-4 max-w-5xl">
                <header className="mb-10">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors mb-4 font-medium"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Volver al Panel Principal
                    </Link>
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
                                {/* {publicUser.commercial_name ? `Bienvenido, ${publicUser.commercial_name}` : "Configura tu empresa en 'Mi Perfil'"} */}
                                Gestiona tu suscripción y acelera tus ventas.
                            </p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: RESUMEN Y PROMOCIÓN */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        
                        {/* Estadísticas */}
                        <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl border border-[var(--ag-sys-color-border)] shadow-sm p-6 sm:p-8">
                            <h2 className="text-xl font-bold text-[var(--ag-sys-color-text)] mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-[var(--ag-sys-color-primary)]" />
                                Resumen del Negocio
                            </h2>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Anuncios Activos</h3>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-black text-[var(--ag-sys-color-text)]">{activeListings || 0}</span>
                                        <span className="text-sm text-gray-400 mb-1 font-medium">/ {isStartPlan ? '15' : isProPlan ? '50' : '∞'} límite</span>
                                    </div>
                                    <Link href="/dashboard" className="text-sm text-[var(--ag-sys-color-primary)] font-bold mt-4 inline-flex hover:underline">Gestionar inventario</Link>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Anuncios Totales</h3>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-black text-[var(--ag-sys-color-text)]">{totalListings || 0}</span>
                                        <span className="text-sm text-gray-400 mb-1 font-medium">históricos</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Herramientas de Promoción */}
                        <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl border border-[var(--ag-sys-color-border)] shadow-sm overflow-hidden">
                            <div className="p-6 sm:p-8 border-b border-[var(--ag-sys-color-border)] bg-gradient-to-r from-green-50 to-emerald-50/20">
                                <h2 className="text-xl font-bold text-green-800 mb-2 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-green-600 fill-green-600" />
                                    Tus Promociones Mensuales
                                </h2>
                                <p className="text-sm text-green-800/80">
                                    Beneficios incluidos con tu cuota mensual. Se renuevan cada mes.
                                </p>
                            </div>
                            
                            <div className="p-6 sm:p-8 space-y-6">
                                {/* Auto-subidas */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 border-b border-gray-100">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2.5 bg-green-100 text-green-600 rounded-xl">
                                            <RefreshCw className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[var(--ag-sys-color-text)] text-lg">Impulsos para subir anuncio</h4>
                                            <p className="text-sm text-[var(--ag-sys-color-text-muted)] font-medium">Regresa tus anuncios a las primeras páginas.</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className="text-2xl font-black text-[var(--ag-sys-color-text)]">{publicUser.available_bumps || 0}</span>
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Disponibles</span>
                                    </div>
                                </div>

                                {/* Destacados */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[var(--ag-sys-color-text)] text-lg">Anuncios Destacados</h4>
                                            <p className="text-sm text-[var(--ag-sys-color-text-muted)] font-medium">Mayor visibilidad en un lugar preferente.</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className="text-2xl font-black text-[var(--ag-sys-color-text)]">{publicUser.available_featured || 0}</span>
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Disponibles</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: SUSCRIPCION */}
                    <div className="lg:col-span-1">
                        <div className="bg-[var(--ag-sys-color-primary)] text-white rounded-3xl shadow-lg border border-[var(--ag-sys-color-primary-hover)] overflow-hidden sticky top-8">
                            <div className="p-8 border-b border-white/20 relative overflow-hidden">
                                <Building2 className="absolute -right-8 -bottom-8 w-40 h-40 text-white/10" />
                                <h3 className="text-sm font-bold uppercase tracking-wider text-green-200 mb-2">Tu Suscripción Activa</h3>
                                <div className="text-4xl font-black mb-1 drop-shadow-sm">Plan {publicUser.plan_type?.toUpperCase() || 'START'}</div>
                                <div className="text-green-100 font-medium">Renovación mensual</div>
                            </div>
                            
                            <div className="p-8 bg-white text-[var(--ag-sys-color-text)]">
                                {publicUser.plan_renews_at && (
                                    <div className="mb-6 pb-6 border-b border-gray-100">
                                        <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Próxima Factura
                                        </div>
                                        <div className="font-bold text-lg">
                                            {new Date(publicUser.plan_renews_at).toLocaleDateString("es-ES", {
                                                year: "numeric", month: "long", day: "numeric"
                                            })}
                                        </div>
                                    </div>
                                )}
                                
                                <form action={portalUrl} method="POST">
                                    <button 
                                        type="submit"
                                        className="w-full flex justify-between items-center py-4 px-5 bg-gray-50 hover:bg-gray-100 rounded-xl font-bold text-[var(--ag-sys-color-text)] transition-colors border border-gray-200 group"
                                    >
                                        <span className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-[var(--ag-sys-color-text-muted)]" /> Gestionar Suscripción</span>
                                        <ChevronRight className="w-5 h-5 text-[var(--ag-sys-color-text-muted)] group-hover:text-[var(--ag-sys-color-text)] transition-colors" />
                                    </button>
                                </form>
                                <p className="text-xs text-center text-gray-400 mt-4 leading-relaxed px-4">
                                    Serás redirigido al portal seguro de Stripe para descargar tus facturas, actualizar tu tarjeta o cancelar tu plan.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
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
