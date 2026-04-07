import Link from "next/link";
import Image from "next/image";
import { Check, ShieldCheck, CreditCard } from "lucide-react";
import { ProPlanCard } from "@/components/profesionales/ProPlanCard";

export const metadata = {
    title: "Área Profesionales y Empresas | Ruralpop",
    description: "Destaca tu empresa donde están tus clientes. Activa tu perfil profesional en Ruralpop.",
};

export default function EmpresasProfesionalesPage() {
    return (
        <div className="min-h-screen w-full bg-[var(--ag-sys-color-background)]">
            {/* Full-width Hero Image pegada al menú */}
            <div className="relative w-full h-[30vh] sm:h-[40vh] md:h-[50vh] lg:h-[60vh] max-h-[600px] mb-12">
                <Image
                    src="/ruralpop-empresas-profesionales.jpg"
                    alt="Ruralpop Empresas y Profesionales"
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
                        Abre tu tienda en Ruralpop
                    </div>
                    <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-[var(--ag-sys-color-text)] tracking-tight leading-[1.1]">
                        Destaca tu empresa donde están tus <span className="text-[var(--ag-sys-color-primary)]">clientes</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-[var(--ag-sys-color-text-muted)] max-w-2xl mx-auto leading-relaxed">
                        Activa tu perfil profesional para estar en el mismo lugar que se encuentran miles de compradores del sector rural cada día.
                    </p>
                </div>
            </section>

            {/* Features & Value Proposition Section */}
            <section className="px-6 pb-20 flex flex-col items-center justify-center">
                <div className="max-w-3xl mx-auto text-center space-y-4 w-full">
                    <p className="text-lg md:text-xl text-[var(--ag-sys-color-text)] font-medium">
                        Cada día, miles de usuarios del sector de la ganadería y agricultura utilizan gratuitamente la app de Ruralpop para conectar, cerrar acuerdos y generar negocio.
                    </p>
                    <p className="text-lg md:text-xl text-[var(--ag-sys-color-text)] font-bold">
                        Por eso, si eres una empresa del sector o profesional debes estar en Ruralpop.
                    </p>
                    
                    <div className="pt-8">
                        <h2 className="text-3xl font-black text-[var(--ag-sys-color-text)] mb-4">
                            Vende más y haz crecer tu <span className="text-[var(--ag-sys-color-primary)]">negocio</span>
                        </h2>
                        
                        <p className="text-lg text-[var(--ag-sys-color-text-muted)] leading-relaxed">
                            Ruralpop se convierte en el punto de encuentro ideal donde tu marca puede llegar a nuevos clientes potenciales.
                        </p>
                        <p className="text-lg text-[var(--ag-sys-color-text-muted)] leading-relaxed mt-2">
                            De forma directa, ágil y sin complicaciones. Para ellos y para ti.
                        </p>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto w-full mt-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[var(--ag-sys-color-primary)]/5 p-8 rounded-3xl border border-[var(--ag-sys-color-primary)]/10 text-left">
                            <h3 className="text-xl font-black text-[var(--ag-sys-color-text)] mb-3">Visibilidad que convierte</h3>
                            <p className="text-[var(--ag-sys-color-text-muted)] leading-relaxed">Tus anuncios aparecen antes, se ven mejor y ocupan posiciones premium para atraer más clics y ventas.</p>
                        </div>
                        <div className="bg-[var(--ag-sys-color-primary)]/5 p-8 rounded-3xl border border-[var(--ag-sys-color-primary)]/10 text-left">
                            <h3 className="text-xl font-black text-[var(--ag-sys-color-text)] mb-3">Credibilidad profesional</h3>
                            <p className="text-[var(--ag-sys-color-text-muted)] leading-relaxed">Todos tus anuncios llevan un sello que transmite confianza y profesionalismo a tus compradores.</p>
                        </div>
                        <div className="bg-[var(--ag-sys-color-primary)]/5 p-8 rounded-3xl border border-[var(--ag-sys-color-primary)]/10 text-left">
                            <h3 className="text-xl font-black text-[var(--ag-sys-color-text)] mb-3">Gestión simplificada</h3>
                            <p className="text-[var(--ag-sys-color-text-muted)] leading-relaxed">Control total desde un solo panel: estadísticas detalladas, mensajes, oportunidades... todo a tu alcance.</p>
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
                                <p className="text-[var(--ag-sys-color-text-muted)] text-sm">Perfecto para profesionales y autónomos que quieren empezar a destacar online.</p>
                            </div>
                            <div className="mb-8">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-[var(--ag-sys-color-text)] tracking-tighter">19,99 €</span>
                                    <span className="text-[var(--ag-sys-color-text-muted)] font-medium">/mes</span>
                                </div>
                                <p className="text-xs text-[var(--ag-sys-color-text-muted)] mt-2">IVA incluido. Cancela cuando quieras.</p>
                            </div>
                            
                            <ul className="space-y-4 mb-10 flex-1">
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-[var(--ag-sys-color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-[var(--ag-sys-color-primary)]" />
                                    </div>
                                    <span className="text-[var(--ag-sys-color-text)] font-medium">Hasta <strong className="text-[var(--ag-sys-color-primary)]">15 anuncios</strong> activos simultáneos</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-[var(--ag-sys-color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-[var(--ag-sys-color-primary)]" />
                                    </div>
                                    <span className="text-[var(--ag-sys-color-text)] font-medium">Página web pública de tu empresa con todos tus productos, <strong className="text-[var(--ag-sys-color-primary)]">logotipo</strong> y descripción.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-[var(--ag-sys-color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-[var(--ag-sys-color-primary)]" />
                                    </div>
                                    <span className="text-[var(--ag-sys-color-text)] font-medium"><strong className="text-[var(--ag-sys-color-primary)]">Sello Profesional Verificado</strong> en tu perfil</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-[var(--ag-sys-color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-[var(--ag-sys-color-primary)]" />
                                    </div>
                                    <span className="text-[var(--ag-sys-color-text)] font-medium"><strong className="text-[var(--ag-sys-color-primary)]">2 impulsos</strong> de subida de anuncio al mes incluidos</span>
                                </li>
                            </ul>

                            <Link href="/profesionales/checkout/start" className="mt-auto w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--ag-sys-color-surface)] border-2 border-[var(--ag-sys-color-primary)] text-[var(--ag-sys-color-primary)] font-bold rounded-2xl hover:bg-[var(--ag-sys-color-primary)] hover:text-white transition-all group-hover:bg-[var(--ag-sys-color-primary)] group-hover:text-white">
                                Empezar ahora
                            </Link>
                        </div>

                        {/* PLAN PRO */}
                        <ProPlanCard isGhostClaim={false} />

                    </div>
                    
                    {/* Trust indicators */}
                    <div className="mt-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-4 text-[var(--ag-sys-color-text-muted)] text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-gray-400" />
                                Pago seguro procesado por Stripe
                            </div>
                            <p>Sin permanencia. Cancela o cambia de plan en cualquier momento desde tu panel de control.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
