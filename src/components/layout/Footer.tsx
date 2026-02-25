import React from "react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-surface)] py-8 mt-auto">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col items-center md:items-start gap-2">
                    <Link
                        href="/"
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <Image src="/ruralpop-logo.png" alt="Ruralpop" width={140} height={40} className="object-contain" />
                    </Link>
                    <p className="text-gray-400 text-sm max-w-sm">
                        La App gratuita para buscar, comprar y vender ganado, maquinaria y mucho más directamente entre ganaderos de toda España.
                    </p>
                </div>

                <div className="flex items-center gap-4 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    <div className="relative w-[135px] h-[40px]">
                        <Image
                            src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                            alt="Descargar en App Store"
                            fill
                            className="object-contain cursor-default"
                        />
                    </div>
                    <div className="relative w-[135px] h-[40px]">
                        <Image
                            src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                            alt="Disponible en Google Play"
                            fill
                            className="object-contain cursor-default"
                        />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8 pt-8 border-t border-[var(--ag-sys-color-border)] flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-[var(--ag-sys-color-text-muted)] order-2 md:order-1">
                    &copy; 2026 Ruralpop. Todos los derechos reservados.
                </div>

                <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-sm text-[var(--ag-sys-color-text-muted)] order-1 md:order-2">
                    <Link href="/legal" className="hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        Aviso legal
                    </Link>
                    <Link href="/privacy" className="hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        Privacidad
                    </Link>
                    <Link href="/cookies" className="hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        Cookies
                    </Link>
                    <Link href="/terms" className="hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        Condiciones
                    </Link>
                    <Link href="/contact" className="hover:text-[var(--ag-sys-color-primary)] transition-colors">
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
