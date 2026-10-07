import Link from "next/link";
import { Check, ShieldCheck, Zap, CreditCard } from "lucide-react";
import { ProPlanCard } from "@/components/profesionales/ProPlanCard";
import { headers } from "next/headers";
import { LocaleCode } from "@/i18n/config";
import { getServerTenantSlug } from "@/utils/tenant/server";

export async function generateMetadata() {
    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';
    const brand = isEquipop ? 'Equipop' : 'Ruralpop';
    const headersList = await headers();
    const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
    const isPt = locale === 'pt';
    
    return {
        title: isPt ? `Área de Profissionais | ${brand}` : `Área Profesionales | ${brand}`,
        description: isPt ? `Destaque a sua empresa onde estão os seus clientes. Ative o seu perfil profissional no ${brand}.` : `Destaca tu empresa donde están tus clientes. Activa tu perfil profesional en ${brand}.`,
    };
}

export default async function ProfesionalesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const sp = await searchParams;
    const isGhostClaim = sp.ghost_claim === 'true';
    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';
    const brand = isEquipop ? 'Equipop' : 'Ruralpop';
    const headersList = await headers();
    const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
    const isPt = locale === 'pt';

    return (
        <div className="min-h-screen bg-[var(--ag-sys-color-background)]">
            {/* Hero Section */}
            <section className="px-6 pt-12 pb-10 lg:pt-16 lg:pb-12 flex items-center justify-center">
                <div className="max-w-4xl mx-auto text-center space-y-6 w-full">
                    {isGhostClaim ? (
                        <>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 font-bold text-sm mb-4 border border-amber-500/20 shadow-sm backdrop-blur-sm">
                                <Zap className="w-4 h-4" />
                                {isPt ? "Passo Final" : "Paso Final"}
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-black text-[var(--ag-sys-color-text)] tracking-tight leading-[1.1]">
                                {isPt ? (
                                    <>Ative a sua <span className="text-[var(--ag-sys-color-primary)]">Montra Pro</span></>
                                ) : (
                                    <>Activa tu <span className="text-[var(--ag-sys-color-primary)]">Escaparate Pro</span></>
                                )}
                            </h1>
                            <p className="text-lg lg:text-xl text-[var(--ag-sys-color-text-muted)] max-w-2xl mx-auto leading-relaxed">
                                {isPt 
                                    ? "Está a um passo de ativar o seu perfil pré-configurado e começar a vender a nível nacional."
                                    : "Estás a un paso de activar tu perfil pre-configurado y empezar a vender a nivel nacional."}
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] font-bold text-sm mb-4 border border-[var(--ag-sys-color-primary)]/20 shadow-sm backdrop-blur-sm">
                                <ShieldCheck className="w-4 h-4" />
                                {isPt ? `Abra a sua loja no ${brand}` : `Abre tu tienda en ${brand}`}
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-black text-[var(--ag-sys-color-text)] tracking-tight leading-[1.1]">
                                {isPt ? (
                                    <>Destaque a sua empresa onde estão os seus <span className="text-[var(--ag-sys-color-primary)]">clientes</span></>
                                ) : (
                                    <>Destaca tu empresa donde están tus <span className="text-[var(--ag-sys-color-primary)]">clientes</span></>
                                )}
                            </h1>
                            <p className="text-lg lg:text-xl text-[var(--ag-sys-color-text-muted)] max-w-2xl mx-auto leading-relaxed">
                                {isPt 
                                    ? `Ative o seu perfil profissional para estar no mesmo local onde se encontram milhares de compradores do setor ${isEquipop ? "equestre" : "rural"} todos os dias.`
                                    : `Activa tu perfil profesional para estar en el mismo lugar que se encuentran miles de compradores del sector ${isEquipop ? "ecuestre" : "rural"} cada día.`}
                            </p>
                        </>
                    )}
                </div>
            </section>

            {/* Pricing Section */}
            <section className="px-6 pb-32">
                <div className="max-w-5xl mx-auto">
                    <div className={`grid grid-cols-1 ${isGhostClaim ? 'max-w-lg mx-auto' : 'md:grid-cols-2'} gap-8 lg:gap-12`}>
                        
                        {/* PLAN START */}
                        {!isGhostClaim && (
                            <div className="bg-[var(--ag-sys-color-surface)] rounded-[2.5rem] p-8 lg:p-10 border border-[var(--ag-sys-color-border)] shadow-sm hover:shadow-xl transition-all duration-300 relative flex flex-col group hover:-translate-y-1">
                                <div className="mb-8">
                                    <h3 className="text-2xl font-black text-[var(--ag-sys-color-text)] tracking-tight mb-2">Plan Start</h3>
                                    <p className="text-[var(--ag-sys-color-text-muted)] text-sm">
                                        {isPt 
                                            ? "Perfeito para profissionais e trabalhadores independentes que querem começar a destacar-se online." 
                                            : "Perfecto para profesionales y autónomos que quieren empezar a destacar online."}
                                    </p>
                                </div>
                                <div className="mb-8">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black text-[var(--ag-sys-color-text)] tracking-tighter">19,99 €</span>
                                        <span className="text-[var(--ag-sys-color-text-muted)] font-medium">{isPt ? "/mês" : "/mes"}</span>
                                    </div>
                                    <p className="text-xs text-[var(--ag-sys-color-text-muted)] mt-2">
                                        {isPt ? "IVA incluído. Cancele quando quiser." : "IVA incluido. Cancela cuando quieras."}
                                    </p>
                                </div>
                                
                                <ul className="space-y-4 mb-10 flex-1">
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3.5 h-3.5 text-green-600" />
                                        </div>
                                        <span className="text-[var(--ag-sys-color-text)] font-medium">
                                            {isPt ? (
                                                <>Até <strong className="text-[var(--ag-sys-color-primary)]">15 anúncios</strong> ativos em simultâneo</>
                                            ) : (
                                                <>Hasta <strong className="text-[var(--ag-sys-color-primary)]">15 anuncios</strong> activos simultáneos</>
                                            )}
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3.5 h-3.5 text-green-600" />
                                        </div>
                                        <span className="text-[var(--ag-sys-color-text)] font-medium">
                                            {isPt ? (
                                                <>Página web pública da sua empresa com todos os seus produtos, <strong className="text-[var(--ag-sys-color-primary)]">logótipo</strong> e descrição.</>
                                            ) : (
                                                <>Página web pública de tu empresa con todos tus productos, <strong className="text-[var(--ag-sys-color-primary)]">logotipo</strong> y descripción.</>
                                            )}
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3.5 h-3.5 text-green-600" />
                                        </div>
                                        <span className="text-[var(--ag-sys-color-text)] font-medium">
                                            {isPt ? (
                                                <><strong className="text-[var(--ag-sys-color-primary)]">Selo Profissional Verificado</strong> no seu perfil</>
                                            ) : (
                                                <><strong className="text-[var(--ag-sys-color-primary)]">Sello Profesional Verificado</strong> en tu perfil</>
                                            )}
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3.5 h-3.5 text-green-600" />
                                        </div>
                                        <span className="text-[var(--ag-sys-color-text)] font-medium">
                                            {isPt ? (
                                                <><strong className="text-[var(--ag-sys-color-primary)]">2 impulsos</strong> para subir anúncio por mês incluídos</>
                                            ) : (
                                                <><strong className="text-[var(--ag-sys-color-primary)]">2 impulsos</strong> de subida de anuncio al mes incluidos</>
                                            )}
                                        </span>
                                    </li>
                                </ul>

                                <Link href="/profesionales/checkout/start" className="mt-auto w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--ag-sys-color-surface)] border-2 border-[var(--ag-sys-color-primary)] text-[var(--ag-sys-color-primary)] font-bold rounded-2xl hover:bg-[var(--ag-sys-color-primary)] hover:text-white transition-all group-hover:bg-[var(--ag-sys-color-primary)] group-hover:text-white">
                                    {isPt ? "Começar agora" : "Empezar ahora"}
                                </Link>
                            </div>
                        )}

                        {/* PLAN PRO */}
                        <ProPlanCard isGhostClaim={isGhostClaim} isEquipop={isEquipop} />

                    </div>
                    
                    {/* Trust indicators */}
                    <div className="mt-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-4 text-[var(--ag-sys-color-text-muted)] text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-gray-400" />
                                {isPt ? "Pagamento seguro processado pela Stripe" : "Pago seguro procesado por Stripe"}
                            </div>
                            <p>
                                {isPt 
                                    ? "Sem fidelização. Cancele ou altere o seu plano a qualquer momento a partir do seu painel de controlo." 
                                    : "Sin permanencia. Cancela o cambia de plan en cualquier momento desde tu panel de control."}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
