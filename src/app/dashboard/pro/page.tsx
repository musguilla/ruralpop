import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { LocaleCode } from "@/i18n/config";
import { ArrowLeft, TrendingUp, RefreshCw, ChevronRight, ShieldCheck, Zap, ExternalLink } from "lucide-react";
import { ProSubscriptionManager } from "@/components/dashboard/ProSubscriptionManager";
import { slugify } from "@/utils/seoUtils";
import { getServerTenantFilterString } from "@/utils/tenant/server";
import { getLoginRedirectUrl } from "@/utils/authRedirect";

export const dynamic = "force-dynamic";

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProfessionalDashboardPage(props: Props) {
    const headersList = await headers();
    const locale = (headersList.get("x-locale") || "es") as LocaleCode;
    const originalPathname = headersList.get("x-original-pathname") || (locale === "pt" ? "/pt/dashboard/pro" : "/dashboard/pro");
    const isPt = locale === "pt";

    const searchParams = await props.searchParams;
    const currentTab = searchParams?.tab === "suscripcion" ? "subscription" : "general";

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(getLoginRedirectUrl(locale, originalPathname));
    }

    // Fetch user and check professional status
    const { data: publicUser } = await supabase
        .from('users')
        .select(`
            id, role, commercial_name, plan_type, available_bumps, available_featured, 
            plan_renews_at, stripe_customer_id, stripe_subscription_id, is_ghost
        `)
        .eq('id', user.id)
        .single();

    if (!publicUser || publicUser.role !== 'profesional') {
        redirect(isPt ? "/pt/profesionales" : "/profesionales");
    }

    if (publicUser.is_ghost) {
        redirect(isPt ? "/pt/profesionales?ghost_claim=true" : "/profesionales?ghost_claim=true");
    }

    // Fetch some basic stats
    const { count: activeListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active')
        .or(await getServerTenantFilterString());
    
    const { count: totalListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .or(await getServerTenantFilterString());

    const isStartPlan = publicUser.plan_type === 'start';
    const isProPlan = publicUser.plan_type === 'pro';

    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 w-full">
            <div className="container mx-auto px-4 max-w-5xl">
                <header className="mb-8">
                    <Link
                        href={isPt ? "/pt/dashboard" : "/dashboard"}
                        className="inline-flex items-center text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors mb-4 font-medium"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        {isPt ? "Voltar ao Painel Principal" : "Volver al Panel Principal"}
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl hidden sm:flex">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight flex items-center gap-3">
                                    {isPt ? "Painel Profissional" : "Panel Profesional"}
                                    <span className={`text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider ${isProPlan ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                                        PLAN {publicUser.plan_type?.toUpperCase() || 'START'}
                                    </span>
                                </h1>
                                <p className="text-[var(--ag-sys-color-text-muted)] mt-2 text-lg">
                                    {isPt ? "Gira os seus contactos, anúncios e destaques para acelerar as suas vendas." : "Gestiona tus contactos, anuncios y promociones para acelerar tus ventas."}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Tabs Navigation & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                    <div className="flex gap-2 p-1 bg-gray-100/50 w-fit rounded-2xl border border-gray-100">
                        <Link
                            href={isPt ? "/pt/dashboard/pro" : "/dashboard/pro"}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${currentTab === 'general'
                                ? 'bg-white text-[var(--ag-sys-color-text)] shadow-sm'
                                : 'text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]'}`}
                        >
                            {isPt ? "Geral" : "General"}
                        </Link>
                        <Link
                            href={isPt ? "/pt/dashboard/pro?tab=suscripcion" : "/dashboard/pro?tab=suscripcion"}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${currentTab === 'subscription'
                                ? 'bg-white text-[var(--ag-sys-color-text)] shadow-sm'
                                : 'text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]'}`}
                        >
                            {isPt ? "Subscrição" : "Suscripción"}
                        </Link>
                    </div>

                    {publicUser.commercial_name && (
                        <Link
                            href={`${isPt ? "/pt" : ""}/empresa/${slugify(publicUser.commercial_name)}`}
                            target="_blank"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text)] font-bold text-sm rounded-xl hover:bg-gray-50 transition-all shadow-sm group"
                        >
                            {isPt ? "Ver perfil de empresa" : "Ver perfil de empresa"}
                            <ExternalLink className="w-4 h-4 text-[var(--ag-sys-color-text-muted)] group-hover:text-[var(--ag-sys-color-primary)] transition-colors" />
                        </Link>
                    )}
                </div>

                {currentTab === 'general' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-3 flex flex-col gap-8">
                            {/* Estadísticas */}
                            <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl border border-[var(--ag-sys-color-border)] shadow-sm p-6 sm:p-10">
                                <h2 className="text-xl font-bold text-[var(--ag-sys-color-text)] mb-8 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-[var(--ag-sys-color-primary)]" />
                                    {isPt ? "Resumo do Negócio" : "Resumen del Negocio"}
                                </h2>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                                            {isPt ? "Anúncios Ativos" : "Anuncios Activos"}
                                        </h3>
                                        <div className="flex items-end gap-3">
                                            <span className="text-5xl font-black text-[var(--ag-sys-color-text)]">{activeListings || 0}</span>
                                            <span className="text-sm text-gray-400 mb-2 font-bold">/ {isStartPlan ? '15' : isProPlan ? '50' : '∞'}</span>
                                        </div>
                                        <Link 
                                            href={totalListings && totalListings > 0 ? (isPt ? "/dashboard" : "/dashboard") : (isPt ? "/upload" : "/upload")} 
                                            className="mt-6 inline-flex items-center gap-2 text-sm text-[var(--ag-sys-color-primary)] font-black hover:gap-3 transition-all"
                                        >
                                            {totalListings && totalListings > 0 
                                                ? (isPt ? "Gerir inventário" : "Gestionar inventario") 
                                                : (isPt ? "Adicione o seu primeiro produto" : "Añade tu primer producto")}
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                    <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                                            {isPt ? "Anúncios Totais" : "Anuncios Totales"}
                                        </h3>
                                        <div className="flex items-end gap-3">
                                            <span className="text-5xl font-black text-[var(--ag-sys-color-text)]">{totalListings || 0}</span>
                                            <span className="text-sm text-gray-400 mb-2 font-bold">
                                                {isPt ? "históricos" : "históricos"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Herramientas de Promoción */}
                            <div className="bg-[var(--ag-sys-color-surface)] rounded-3xl border border-[var(--ag-sys-color-border)] shadow-sm overflow-hidden">
                                <div className="p-8 border-b border-[var(--ag-sys-color-border)] bg-gradient-to-r from-green-50 to-emerald-50/20">
                                    <h2 className="text-xl font-bold text-green-800 mb-1 flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-green-600 fill-green-600" />
                                        {isPt ? "As suas Promoções Mensais" : "Tus Promociones Mensuales"}
                                    </h2>
                                    <p className="text-sm text-green-700/70 font-medium">
                                        {isPt 
                                            ? "Vantagens incluídas para aumentar a sua visibilidade. Renovam-se todos os meses." 
                                            : "Beneficios incluidos para aumentar tu visibilidad. Se renuevan cada mes."}
                                    </p>
                                </div>
                                
                                <div className="p-8 space-y-8">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 py-2">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
                                                <RefreshCw className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[var(--ag-sys-color-text)] text-xl">
                                                    {isPt ? "Impulsos para subir anúncio" : "Impulsos para subir anuncio"}
                                                </h4>
                                                <p className="text-sm text-[var(--ag-sys-color-text-muted)] font-medium max-w-xs">
                                                    {isPt 
                                                        ? "Coloque os seus anúncios de novo nas primeiras posições rapidamente." 
                                                        : "Coloca tus anuncios de nuevo en las primeras páginas rápidamente."}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-green-50 border border-green-100 rounded-2xl px-6 py-4 text-center min-w-[140px]">
                                            <div className="text-3xl font-black text-green-700">{publicUser.available_bumps || 0}</div>
                                            <div className="text-[10px] text-green-600 font-bold uppercase tracking-wider">
                                                {isPt ? "Disponíveis" : "Disponibles"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 py-2">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                                                <ShieldCheck className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[var(--ag-sys-color-text)] text-xl">
                                                    {isPt ? "Anúncios Destacados" : "Anuncios Destacados"}
                                                </h4>
                                                <p className="text-sm text-[var(--ag-sys-color-text-muted)] font-medium max-w-xs">
                                                    {isPt 
                                                        ? "Os seus anúncios em locais de destaque na categoria." 
                                                        : "Tus anuncios en lugares preferentes de la categoría."}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-6 py-4 text-center min-w-[140px]">
                                            <div className="text-3xl font-black text-amber-700">{publicUser.available_featured || 0}</div>
                                            <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                                                {isPt ? "Disponíveis" : "Disponibles"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <ProSubscriptionManager 
                        planType={publicUser.plan_type}
                        renewsAt={publicUser.plan_renews_at}
                        stripeSubscriptionId={publicUser.stripe_subscription_id}
                    />
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
 * - Preservación de Localización (/pt): Se captura el locale del header y el originalPathname para que, en caso de sesión no iniciada,
 *   se invoque getLoginRedirectUrl(locale, originalPathname) manteniendo /pt y el parámetro redirectTo exacto.
 * - Navegación y enlaces internos traducidos y prefijados con /pt cuando se accede desde la versión portuguesa.
 */
