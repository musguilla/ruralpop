import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-surface)] py-8 mt-auto">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="flex flex-col items-center md:items-start gap-2 max-w-xs xl:max-w-sm shrink-0">
                        <div className="flex items-center justify-between w-full">
                            <Link
                                href="/"
                                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            >
                                <Image src="/ruralpop-logo.png" alt="Ruralpop" width={140} height={40} className="object-contain dark:invert" />
                            </Link>
                            <a href="https://www.instagram.com/ruralpopapp" target="_blank" rel="noopener noreferrer" className="text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors pr-2" aria-label="Instagram">
                                <Instagram className="w-7 h-7" strokeWidth={2.25} />
                            </a>
                        </div>
                        <p className="text-[var(--ag-sys-color-text-muted)] text-sm text-center md:text-left mt-2">
                            La App gratuita para buscar, comprar y vender ganado, maquinaria y mucho más directamente entre ganaderos de toda España.
                        </p>
                    </div>

                    {/* Vertical line 1 */}
                    <div className="hidden md:block w-px h-20 bg-[var(--ag-sys-color-border)] mt-1 shrink-0"></div>

                    <div className="flex flex-col items-center md:items-start pt-1 gap-2 shrink-0">
                        <span className="text-[10px] text-[var(--ag-sys-color-text-muted)] font-semibold uppercase tracking-wider mb-1 whitespace-nowrap">
                            Conexión Rural
                        </span>
                        <Link href="/tienda" className="text-base font-bold text-[var(--ag-sys-color-primary)] hover:opacity-80 transition-opacity whitespace-nowrap">
                            Tienda Ruralpop
                        </Link>
                        <Link href="/magazine" className="text-base font-bold text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors whitespace-nowrap">
                            Ruralpop Magazine
                        </Link>
                        <Link href="/tractores" className="text-base font-bold text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors whitespace-nowrap">
                            Catálogos de Tractores
                        </Link>
                        <Link href="/precios-ganado/vacuno" className="text-base font-bold text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors whitespace-nowrap">
                            Precios Mercados Vacuno
                        </Link>
                    </div>

                    {/* Vertical line 2 */}
                    <div className="hidden md:block w-px h-28 bg-[var(--ag-sys-color-border)] mt-1 shrink-0"></div>

                    <div className="flex flex-col items-center md:items-start pt-1 gap-2 shrink-0">
                        <span className="text-[10px] text-[var(--ag-sys-color-text-muted)] font-semibold uppercase tracking-wider mb-1 whitespace-nowrap">
                            Información
                        </span>
                        <Link href="/preguntas-frecuentes" className="text-base font-bold text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors whitespace-nowrap">
                            Preguntas frecuentes
                        </Link>
                        <Link href="/empresas-profesionales-sector-rural" className="text-base font-bold text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors whitespace-nowrap">
                            ¿Eres profesional?
                        </Link>
                    </div>
                </div>

                {/* Vertical line 3 */}
                <div className="hidden lg:block w-px h-20 bg-[var(--ag-sys-color-border)] shrink-0"></div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-4 mt-4 sm:mt-0 shrink-0">
                    {/* Apple App Store Native SVG Badge */}
                    <a href="https://apps.apple.com/es/app/ruralpop/id6759678666" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-all cursor-pointer shrink-0" title="Descargar en el App Store">
                        <img src="https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/wpublic/app-store-logo.svg" alt="Descargar en el App Store" className="h-10 w-auto" />
                    </a>

                    {/* Google Play Native SVG Badge */}
                    <a href="https://play.google.com/store/apps/details?id=com.ruralpop.app" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-all cursor-pointer shrink-0" title="Descargar en Google Play">
                        <img src="https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/wpublic/google-play-logo.svg" alt="Descargar en Google Play" className="h-10 w-auto" />
                    </a>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8 pt-8 border-t border-[var(--ag-sys-color-border)] flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-[var(--ag-sys-color-text-muted)] order-2 md:order-1">
                    &copy; 2026 Ruralpop. Todos los derechos reservados.
                </div>

                <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-sm text-[var(--ag-sys-color-text)] order-1 md:order-2">
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
            </div>
        </footer>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Footer sencillo con links de soporte y marca.
 * - 'mt-auto' asegurará que el footer sea empujado hacia abajo si el main container flex es un min-h-screen.
 * - Typings puros y sin fallos ocultos.
 */
