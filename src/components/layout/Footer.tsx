import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-surface)] py-12 mt-auto">
            {/* Top Section: 4 Columns with Dividers */}
            <div className="container mx-auto px-4 flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-4 mb-12">
                
                {/* Column 1: Conexión Rural */}
                <div className="flex flex-col items-start gap-3 lg:w-1/4">
                    <span className="text-[13px] text-[var(--ag-sys-color-text)] font-semibold uppercase tracking-wider mb-1">
                        Conexión Rural
                    </span>
                    <Link href="/tienda" className="text-base font-medium text-[var(--ag-sys-color-primary)] hover:opacity-80 transition-opacity">
                        Tienda Ruralpop
                    </Link>
                    <Link href="/magazine" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        Ruralpop Magazine
                    </Link>
                    <Link href="/tractores" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        Catálogos de Tractores
                    </Link>
                    <Link href="/precios-ganado/vacuno" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        Precios Mercados Vacuno
                    </Link>
                </div>

                {/* Vertical Divider 1 */}
                <div className="hidden lg:block w-px h-auto self-stretch bg-[var(--ag-sys-color-border)] shrink-0"></div>

                {/* Column 2: Lonjas y Mercados España */}
                <div className="flex flex-col items-start gap-3 lg:w-1/3 lg:pl-10">
                    <span className="text-[13px] text-[var(--ag-sys-color-text)] font-semibold uppercase tracking-wider mb-1">
                        Lonjas y Mercados España
                    </span>
                    <Link href="/precios-ganado/vacuno" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        Precios Lonjas y Mercado Bovino
                    </Link>
                    <Link href="/precios-ganado/vacuno/mercados/lonja-de-salamanca" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        Lonja de Salamanca
                    </Link>
                    <Link href="/precios-ganado/vacuno/mercados/mercado-nacional-de-ganado-de-pola-de-siero" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        Mercado Ganado Pola de Siero
                    </Link>
                    <Link href="/precios-ganado/vacuno/mercados/lonja-agropecuaria-de-talavera-de-la-reina" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        Lonja Talavera de la Reina
                    </Link>
                    <Link href="/precios-ganado/vacuno/mercados/lonja-agropecuaria-de-leon" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        Lonja Agropecuaria de León
                    </Link>
                    <Link href="/precios-ganado/vacuno/mercados/mercado-nacional-santiago-de-compostela" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        Mercado Nacional Santiago
                    </Link>
                </div>

                {/* Vertical Divider 2 */}
                <div className="hidden lg:block w-px h-auto self-stretch bg-[var(--ag-sys-color-border)] shrink-0"></div>

                {/* Column 3: Información */}
                <div className="flex flex-col items-start gap-3 lg:w-1/5 lg:pl-10">
                    <span className="text-[13px] text-[var(--ag-sys-color-text)] font-semibold uppercase tracking-wider mb-1">
                        Información
                    </span>
                    <Link href="/preguntas-frecuentes" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        Preguntas frecuentes
                    </Link>
                    <Link href="/empresas-profesionales-sector-rural" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        ¿Eres profesional?
                    </Link>
                </div>

                {/* Vertical Divider 3 */}
                <div className="hidden lg:block w-px h-auto self-stretch bg-[var(--ag-sys-color-border)] shrink-0"></div>

                {/* Column 4: App Store / Google Play */}
                <div className="flex flex-row lg:flex-col items-start gap-4 lg:w-1/5 lg:items-end">
                    {/* Google Play Native SVG Badge */}
                    <a href="https://play.google.com/store/apps/details?id=com.ruralpop.app" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-all cursor-pointer" title="Descargar en Google Play">
                        <img src="https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/wpublic/google-play-logo.svg" alt="Descargar en Google Play" className="h-[52px] w-auto" />
                    </a>

                    {/* Apple App Store Native SVG Badge */}
                    <a href="https://apps.apple.com/es/app/ruralpop/id6759678666" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-all cursor-pointer" title="Descargar en el App Store">
                        <img src="https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/wpublic/app-store-logo.svg" alt="Descargar en el App Store" className="h-[52px] w-auto" />
                    </a>
                </div>

            </div>

            {/* Bottom Section */}
            <div className="container mx-auto px-4 pt-8 border-t border-[var(--ag-sys-color-border)] flex flex-col lg:flex-row justify-between items-start gap-8">
                
                {/* Left: Logo & Description */}
                <div className="flex flex-col max-w-sm gap-4">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="hover:opacity-80 transition-opacity">
                            <Image src="/ruralpop-logo.png" alt="Ruralpop" width={140} height={40} className="object-contain dark:invert" />
                        </Link>
                        <a href="https://www.instagram.com/ruralpopapp" target="_blank" rel="noopener noreferrer" className="text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors" aria-label="Instagram">
                            <Instagram className="w-7 h-7" strokeWidth={2.25} />
                        </a>
                    </div>
                    <p className="text-[var(--ag-sys-color-text-muted)] text-sm leading-relaxed">
                        La App gratuita para buscar, comprar y vender ganado, maquinaria y mucho más directamente entre ganaderos de toda España.
                    </p>
                </div>

                {/* Right: Legal & Copyright */}
                <div className="flex flex-col lg:items-end gap-6">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--ag-sys-color-text)]">
                        <Link href="/aviso-legal" className="hover:text-[var(--ag-sys-color-primary)] transition-colors" rel="nofollow">
                            Aviso legal
                        </Link>
                        <Link href="/privacy" className="hover:text-[var(--ag-sys-color-primary)] transition-colors" rel="nofollow">
                            Política de privacidad
                        </Link>
                        <Link href="/cookies" className="hover:text-[var(--ag-sys-color-primary)] transition-colors" rel="nofollow">
                            Cookies
                        </Link>
                        <Link href="/terms" className="hover:text-[var(--ag-sys-color-primary)] transition-colors" rel="nofollow">
                            Condiciones de uso
                        </Link>
                        <Link href="/contact" className="hover:text-[var(--ag-sys-color-primary)] transition-colors" rel="nofollow">
                            Contacto
                        </Link>
                    </div>
                    <div className="text-sm text-[var(--ag-sys-color-text-muted)]">
                        &copy; {currentYear} Ruralpop. Todos los derechos reservados.
                    </div>
                </div>

            </div>
        </footer>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Footer reestructurado en 4 columnas principales (top) y una sección inferior para logo, info y legales.
 * - 'mt-auto' asegurará que el footer sea empujado hacia abajo si el main container flex es un min-h-screen.
 * - Se han incluido todas las lonjas utilizando sus slugs para mantener SEO robusto.
 */
