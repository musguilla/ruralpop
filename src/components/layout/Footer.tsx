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
                    <div className="flex flex-col items-center md:items-start gap-2 max-w-sm">
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
                    <div className="hidden md:block w-px h-20 bg-[var(--ag-sys-color-border)] mt-1"></div>

                    <div className="flex flex-col items-center md:items-start pt-1">
                        <span className="text-[10px] text-[var(--ag-sys-color-text-muted)] font-semibold uppercase tracking-wider mb-1">
                            Conexión Rural
                        </span>
                        <Link href="/magazine" className="text-base font-bold text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                            Ruralpop Magazine
                        </Link>
                    </div>

                    {/* Vertical line 2 */}
                    <div className="hidden md:block w-px h-20 bg-[var(--ag-sys-color-border)] mt-1"></div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-4 mt-4 sm:mt-0">
                    {/* Apple App Store Native SVG Badge */}
                    <a href="https://apps.apple.com/es/app/ruralpop/id6759678666" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 hover:opacity-80 transition-all cursor-pointer" title="Descargar en el App Store">
                        <div className="flex items-center bg-black text-white px-4 py-2 rounded-xl border border-gray-800">
                            <svg viewBox="0 0 384 512" width="24" height="24" fill="currentColor" className="mr-3">
                                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                            </svg>
                            <div className="flex flex-col text-left">
                                <span className="text-[10px] uppercase leading-none mb-1 text-gray-300">Descárgalo en el</span>
                                <span className="text-xl font-semibold leading-none tracking-tight">App Store</span>
                            </div>
                        </div>
                    </a>

                    {/* Google Play Native SVG Badge */}
                    <div className="flex flex-col items-center gap-1.5 opacity-60 grayscale cursor-default transition-all" title="Próximamente">
                        <div className="flex items-center bg-black text-white px-4 py-2 rounded-xl border border-gray-800 pointer-events-none">
                            <svg viewBox="0 0 512 512" width="24" height="24" fill="currentColor" className="mr-3">
                                <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                            </svg>
                            <div className="flex flex-col text-left">
                                <span className="text-[10px] uppercase leading-none mb-1 text-gray-300">Disponible en</span>
                                <span className="text-xl font-semibold leading-none tracking-tight">Google Play</span>
                            </div>
                        </div>
                        <span className="text-[9px] bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text-muted)] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Próximamente</span>
                    </div>
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
