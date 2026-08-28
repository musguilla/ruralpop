import Link from "next/link";
import Image from "next/image";
import { Check, ShieldCheck, CreditCard } from "lucide-react";
import { ProPlanCard } from "@/components/profesionales/ProPlanCard";
import { getServerTenantSlug } from "@/utils/tenant/server";
import { headers } from "next/headers";

export async function generateMetadata() {
    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';
    const brand = isEquipop ? 'Equipop' : 'Ruralpop';
    
    return {
        title: `Área Profesionales y Empresas | ${brand}`,
        description: `Destaca tu empresa donde están tus clientes. Activa tu perfil profesional en ${brand}.`,
        alternates: { canonical: isEquipop ? "/empresas-profesionales-sector-ecuestre" : "/empresas-profesionales-sector-rural" }
    };
}

export default async function EmpresasProfesionalesPage() {
    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';
    const brand = isEquipop ? 'Equipop' : 'Ruralpop';

    const headersList = await headers();
    const locale = headersList.get('x-locale') || 'es';
    const isPt = locale === 'pt';

    return (
        <div className="min-h-screen w-full bg-[var(--ag-sys-color-background)]">
            {/* Full-width Hero Image pegada al menú */}
            <div className="relative w-full h-[30vh] sm:h-[40vh] md:h-[50vh] lg:h-[60vh] max-h-[600px] mb-12">
                <Image
                    src={isEquipop ? "/tiendas-equitacion-equipop.jpg" : "/ruralpop-empresas-profesionales.jpg"}
                    alt={`${brand} Empresas y Profesionales`}
                    fill
                    priority
                    className="object-cover"
                    sizes="100vw"
                    quality={90}
                />
            </div>

            {/* Title & CTA Intro Section */}
            <section className="px-6 pt-2 pb-10 flex items-center justify-center">
                <div className="max-w-4xl mx-auto text-center space-y-6 w-full">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] font-bold text-sm mb-4 border border-[var(--ag-sys-color-primary)]/20 shadow-sm backdrop-blur-sm">
                        <ShieldCheck className="w-4 h-4" />
                        {isPt ? `Abra a sua loja no ${brand}` : `Abre tu tienda en ${brand}`}
                    </div>
                    <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-[var(--ag-sys-color-text)] tracking-tight leading-[1.1]">
                        {isPt ? "Destaque a sua empresa onde estão os seus " : "Destaca tu empresa donde están tus "}
                        <span className="text-[var(--ag-sys-color-primary)]">{isPt ? "clientes" : "clientes"}</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-[var(--ag-sys-color-text-muted)] max-w-2xl mx-auto leading-relaxed">
                        {isPt 
                            ? `Ative o seu perfil profissional para estar no mesmo local onde se encontram milhares de compradores do setor ${isEquipop ? "equestre" : "rural"} todos os dias.` 
                            : `Activa tu perfil profesional para estar en el mismo lugar que se encuentran miles de compradores del sector ${isEquipop ? "ecuestre" : "rural"} cada día.`
                        }
                    </p>
                </div>
            </section>

            {/* Features & Value Proposition Section */}
            <section className="px-6 pb-20 flex flex-col items-center justify-center">
                <div className="max-w-3xl mx-auto text-center space-y-4 w-full">
                    <p className="text-lg md:text-xl text-[var(--ag-sys-color-text)] font-medium">
                        {isPt 
                            ? `Todos os dias, milhares de utilizadores do setor ${isEquipop ? "dos cavalos e da equitação" : "pecuário e agrícola"} utilizam gratuitamente a aplicação ${brand} para conectar, fechar acordos e gerar negócios.`
                            : `Cada día, miles de usuarios del sector ${isEquipop ? "del caballo y la equitación" : "de la ganadería y agricultura"} utilizan gratuitamente la app de ${brand} para conectar, cerrar acuerdos y generar negocio.`
                        }
                    </p>
                    <p className="text-lg md:text-xl text-[var(--ag-sys-color-text)] font-bold">
                        {isPt 
                            ? `Por isso, se é uma empresa do setor ou profissional, deve estar no ${brand}.`
                            : `Por eso, si eres una empresa del sector o profesional debes estar en ${brand}.`
                        }
                    </p>
                    
                    <div className="pt-8">
                        <h2 className="text-3xl font-black text-[var(--ag-sys-color-text)] mb-4">
                            {isPt ? "Venda mais e faça crescer o seu " : "Vende más y haz crecer tu "}
                            <span className="text-[var(--ag-sys-color-primary)]">{isPt ? "negócio" : "negocio"}</span>
                        </h2>
                        
                        <p className="text-lg text-[var(--ag-sys-color-text-muted)] leading-relaxed">
                            {isPt ? `${brand} torna-se o ponto de encontro ideal onde a sua marca pode alcançar novos potenciais clientes.` : `${brand} se convierte en el punto de encuentro ideal donde tu marca puede llegar a nuevos clientes potenciales.`}
                        </p>
                        <p className="text-lg text-[var(--ag-sys-color-text-muted)] leading-relaxed mt-2">
                            {isPt ? "De forma direta, ágil e sem complicações. Para eles e para si." : "De forma directa, ágil y sin complicaciones. Para ellos y para ti."}
                        </p>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto w-full mt-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[var(--ag-sys-color-primary)]/5 p-8 rounded-3xl border border-[var(--ag-sys-color-primary)]/10 text-left">
                            <h3 className="text-xl font-black text-[var(--ag-sys-color-text)] mb-3">{isPt ? "Visibilidade que converte" : "Visibilidad que convierte"}</h3>
                            <p className="text-[var(--ag-sys-color-text-muted)] leading-relaxed">{isPt ? "Os seus anúncios aparecem primeiro, parecem melhores e ocupam posições premium para atrair mais cliques e vendas." : "Tus anuncios aparecen antes, se ven mejor y ocupan posiciones premium para atraer más clics y ventas."}</p>
                        </div>
                        <div className="bg-[var(--ag-sys-color-primary)]/5 p-8 rounded-3xl border border-[var(--ag-sys-color-primary)]/10 text-left">
                            <h3 className="text-xl font-black text-[var(--ag-sys-color-text)] mb-3">{isPt ? "Credibilidade profissional" : "Credibilidad profesional"}</h3>
                            <p className="text-[var(--ag-sys-color-text-muted)] leading-relaxed">{isPt ? "Todos os seus anúncios ostentam um selo de perfil verificado que transmite confiança aos seus compradores." : "Todos tus anuncios llevan un sello de perfil verificado que transmite confianza a tus compradores."}</p>
                        </div>
                        <div className="bg-[var(--ag-sys-color-primary)]/5 p-8 rounded-3xl border border-[var(--ag-sys-color-primary)]/10 text-left">
                            <h3 className="text-xl font-black text-[var(--ag-sys-color-text)] mb-3">{isPt ? "Gestão simplificada" : "Gestión simplificada"}</h3>
                            <p className="text-[var(--ag-sys-color-text-muted)] leading-relaxed">{isPt ? "Controlo total a partir de um único painel: estatísticas detalhadas, mensagens, oportunidades... tudo ao seu alcance." : "Control total desde un solo panel: estadísticas detalladas, mensajes, oportunidades... todo a tu alcance."}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section (con el diseño original en Surface flotando sobre el Background gris/oscuro) */}
            <section className="px-6 pb-32 mt-4">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        
                        {/* PLAN START */}
                        <div className="bg-[var(--ag-sys-color-surface)] rounded-[2.5rem] p-8 lg:p-10 border border-[var(--ag-sys-color-border)] shadow-sm hover:shadow-xl transition-all duration-300 relative flex flex-col group hover:-translate-y-1">
                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-[var(--ag-sys-color-text)] tracking-tight mb-2">Plan Start</h3>
                                <p className="text-[var(--ag-sys-color-text-muted)] text-sm">{isPt ? "Perfeito para profissionais e trabalhadores independentes que querem começar a destacar-se online." : "Perfecto para profesionales y autónomos que quieren empezar a destacar online."}</p>
                            </div>
                            <div className="mb-8">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-[var(--ag-sys-color-text)] tracking-tighter">19,99 €</span>
                                    <span className="text-[var(--ag-sys-color-text-muted)] font-medium">{isPt ? "/mês" : "/mes"}</span>
                                </div>
                                <p className="text-xs text-[var(--ag-sys-color-text-muted)] mt-2">{isPt ? "IVA incluído. Cancele quando quiser." : "IVA incluido. Cancela cuando quieras."}</p>
                            </div>
                            
                            <ul className="space-y-4 mb-10 flex-1">
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-[var(--ag-sys-color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-[var(--ag-sys-color-primary)]" />
                                    </div>
                                    <span className="text-[var(--ag-sys-color-text)] font-medium">{isPt ? "Até " : "Hasta "}<strong className="text-[var(--ag-sys-color-primary)]">{isPt ? "15 anúncios" : "15 anuncios"}</strong> {isPt ? "ativos em simultâneo" : "activos simultáneos"}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-[var(--ag-sys-color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-[var(--ag-sys-color-primary)]" />
                                    </div>
                                    <span className="text-[var(--ag-sys-color-text)] font-medium">{isPt ? "Página web pública da sua empresa com todos os seus produtos, " : "Página web pública de tu empresa con todos tus productos, "}<strong className="text-[var(--ag-sys-color-primary)]">{isPt ? "logótipo" : "logotipo"}</strong> {isPt ? "e descrição." : "y descripción."}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-[var(--ag-sys-color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-[var(--ag-sys-color-primary)]" />
                                    </div>
                                    <span className="text-[var(--ag-sys-color-text)] font-medium"><strong className="text-[var(--ag-sys-color-primary)]">{isPt ? "Selo Profissional Verificado" : "Sello Profesional Verificado"}</strong> {isPt ? "no seu perfil" : "en tu perfil"}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-[var(--ag-sys-color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-[var(--ag-sys-color-primary)]" />
                                    </div>
                                    <span className="text-[var(--ag-sys-color-text)] font-medium"><strong className="text-[var(--ag-sys-color-primary)]">{isPt ? "2 impulsos" : "2 impulsos"}</strong> {isPt ? "de subida de anúncio por mês incluídos" : "de subida de anuncio al mes incluidos"}</span>
                                </li>
                            </ul>

                            <Link href={`${isPt ? '/pt' : ''}/profesionales/checkout/start`} className="mt-auto w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--ag-sys-color-surface)] border-2 border-[var(--ag-sys-color-primary)] text-[var(--ag-sys-color-primary)] font-bold rounded-2xl hover:bg-[var(--ag-sys-color-primary)] hover:text-white transition-all group-hover:bg-[var(--ag-sys-color-primary)] group-hover:text-white">
                                {isPt ? "Começar agora" : "Empezar ahora"}
                            </Link>
                        </div>

                        {/* PLAN PRO */}
                        <ProPlanCard isGhostClaim={false} isEquipop={isEquipop} />

                    </div>
                    
                    {/* Trust indicators */}
                    <div className="mt-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-4 text-[var(--ag-sys-color-text-muted)] text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-gray-400" />
                                {isPt ? "Pagamento seguro processado por Stripe" : "Pago seguro procesado por Stripe"}
                            </div>
                            <p>{isPt ? "Sem fidelização. Cancele ou altere de plano a qualquer momento a partir do seu painel de controlo." : "Sin permanencia. Cancela o cambia de plan en cualquier momento desde tu panel de control."}</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
