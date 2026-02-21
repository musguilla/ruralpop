import React from "react";
import Link from "next/link";
import { Tractor } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-surface)] py-8 mt-auto">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col items-center md:items-start gap-2">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-[var(--ag-sys-color-primary)]"
                    >
                        <Tractor className="w-6 h-6" />
                        <span className="text-lg font-bold text-[var(--ag-sys-color-text)]">
                            Ruralpop
                        </span>
                    </Link>
                    <p className="text-sm text-[var(--ag-sys-color-text-muted)] text-center md:text-left max-w-sm">
                        El mercado líder en compra y venta de animales, maquinaria y productos del campo.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-6 text-sm text-[var(--ag-sys-color-text-muted)]">
                    <Link href="/about" className="hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        Sobre Nosotros
                    </Link>
                    <Link href="/terms" className="hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        Términos y Condiciones
                    </Link>
                    <Link href="/privacy" className="hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        Privacidad
                    </Link>
                    <Link href="/contact" className="hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        Contacto
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8 pt-4 border-t border-[var(--ag-sys-color-border)] text-center text-xs text-[var(--ag-sys-color-text-muted)]">
                &copy; {currentYear} Ruralpop. Todos los derechos reservados.
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
