import Link from "next/link";
import { Check, ShieldCheck, Zap, PackageOpen, Tag, Settings, CreditCard } from "lucide-react";

export const metadata = {
    title: "Área Profesionales | Ruralpop",
    description: "Destaca tu empresa donde están tus clientes. Activa tu perfil profesional en Ruralpop.",
};

export default function ProfesionalesPage() {
    return (
        <div className="min-h-screen bg-[var(--ag-sys-color-background)]">
            {/* Hero Section */}
            <section className="relative px-6 py-20 lg:py-32 overflow-hidden flex items-center justify-center">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-[var(--ag-sys-color-primary)] rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob"></div>
                <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-2000"></div>

                <div className="relative max-w-4xl mx-auto text-center space-y-8 z-10 w-full">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] font-bold text-sm mb-4 border border-[var(--ag-sys-color-primary)]/20 shadow-sm backdrop-blur-sm">
                        <ShieldCheck className="w-4 h-4" />
                        Abre tu tienda en Ruralpop
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-black text-[var(--ag-sys-color-text)] tracking-tight leading-[1.1]">
                        Destaca tu empresa donde están tus <span className="text-[var(--ag-sys-color-primary)]">clientes</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-[var(--ag-sys-color-text-muted)] max-w-2xl mx-auto leading-relaxed">
                        Activa tu perfil profesional para estar en el mismo lugar que se encuentran miles de compradores del sector rural cada día.
                    </p>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="px-6 pb-32">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        
                        {/* PLAN START */}
                        <div className="bg-[var(--ag-sys-color-surface)] rounded-[2.5rem] p-8 lg:p-10 border border-[var(--ag-sys-color-border)] shadow-sm hover:shadow-xl transition-all duration-300 relative flex flex-col group hover:-translate-y-1">
                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-[var(--ag-sys-color-text)] tracking-tight mb-2">Plan Start</h3>
                                <p className="text-[var(--ag-sys-color-text-muted)] text-sm">Perfecto para pequeños negocios y autónomos que quieren empezar a destacar online.</p>
                            </div>
                            <div className="mb-8">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-[var(--ag-sys-color-text)] tracking-tighter">19,99€</span>
                                    <span className="text-[var(--ag-sys-color-text-muted)] font-medium">/mes</span>
                                </div>
                                <p className="text-xs text-[var(--ag-sys-color-text-muted)] mt-2">IVA incluido. Cancela cuando quieras.</p>
                            </div>
                            
                            <ul className="space-y-4 mb-10 flex-1">
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-green-600" />
                                    </div>
                                    <span className="text-[var(--ag-sys-color-text)] font-medium">Hasta <strong className="text-[var(--ag-sys-color-primary)]">15 anuncios</strong> activos simultáneos</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-green-600" />
                                    </div>
                                    <span className="text-[var(--ag-sys-color-text)] font-medium">Perfil de empresa con <strong className="text-[var(--ag-sys-color-primary)]">logotipo</strong> y descripción</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-green-600" />
                                    </div>
                                    <span className="text-[var(--ag-sys-color-text)] font-medium"><strong className="text-[var(--ag-sys-color-primary)]">Sello profesional</strong> en tus anuncios</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-green-600" />
                                    </div>
                                    <span className="text-[var(--ag-sys-color-text)] font-medium"><strong className="text-[var(--ag-sys-color-primary)]">2 impulsos</strong> de subida de anuncio al mes gratis</span>
                                </li>
                            </ul>

                            <form action="/api/create-subscription" method="POST" className="mt-auto">
                                <input type="hidden" name="priceId" value="price_1TBJ6b6eGJa0K3pVDmyCDPeW" />
                                <button type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--ag-sys-color-surface)] border-2 border-[var(--ag-sys-color-primary)] text-[var(--ag-sys-color-primary)] font-bold rounded-2xl hover:bg-[var(--ag-sys-color-primary)] hover:text-white transition-all group-hover:bg-[var(--ag-sys-color-primary)] group-hover:text-white">
                                    <Settings className="w-5 h-5" />
                                    Seleccionar START
                                </button>
                            </form>
                        </div>

                        {/* PLAN PRO */}
                        <div className="bg-[var(--ag-sys-color-primary)] rounded-[2.5rem] p-8 lg:p-10 border border-[var(--ag-sys-color-primary)] shadow-2xl relative flex flex-col transform md:-translate-y-4">
                            <div className="absolute top-0 right-8 -mt-4 bg-white text-[var(--ag-sys-color-primary)] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                El más popular
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-[2.5rem] pointer-events-none"></div>
                            
                            <div className="mb-8 relative z-10">
                                <h3 className="text-2xl font-black text-white tracking-tight mb-2 flex items-center gap-2">Plan Pro <Zap className="w-5 h-5 text-amber-300 fill-amber-300" /></h3>
                                <p className="text-white/80 text-sm">El arma definitiva para concesionarios, criadores y profesionales con alto volumen de stock.</p>
                            </div>
                            <div className="mb-8 relative z-10">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-white tracking-tighter">49,99€</span>
                                    <span className="text-white/80 font-medium">/mes</span>
                                </div>
                                <p className="text-xs text-white/70 mt-2">IVA incluido. Cancela cuando quieras.</p>
                            </div>
                            
                            <ul className="space-y-4 mb-10 flex-1 relative z-10">
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-white font-medium">Hasta <strong className="text-amber-300 font-bold">50 anuncios</strong> activos simultáneos</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-white font-medium">Página web pública de tu empresa con todos tus productos y logotipo</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-white font-medium">Sello / Badge <strong className="text-amber-300 font-bold">Profesional Pro</strong> destacado</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-white font-medium"><strong className="text-amber-300 font-bold">6 impulsos</strong> de subida de anuncio al mes gratis</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-white font-medium"><strong className="text-amber-300 font-bold">2 anuncios destacados</strong> en página principal</span>
                                </li>
                            </ul>

                            <form action="/api/create-subscription" method="POST" className="mt-auto relative z-10">
                                <input type="hidden" name="priceId" value="price_1TBJ7M6eGJa0K3pVFfx0h8Fz" />
                                <button type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-[var(--ag-sys-color-primary)] font-black rounded-2xl hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5">
                                    <Zap className="w-5 h-5" />
                                    Quiero el PRO
                                </button>
                            </form>
                        </div>

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
