"use client";

import React from "react";
import { FileText } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-[2rem] p-8 sm:p-12 shadow-sm">
                <header className="mb-8 border-b border-[var(--ag-sys-color-border)] pb-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] rounded-full flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">Términos y Condiciones</h1>
                        <p className="text-[var(--ag-sys-color-text-muted)] mt-1 font-medium">Condiciones de uso de Ruralpop</p>
                    </div>
                </header>

                <div className="prose prose-sm sm:prose-base max-w-none text-[var(--ag-sys-color-text)] leading-relaxed space-y-6">
                    <p>
                        Estos Términos y Condiciones regulan el uso de la plataforma <strong>Ruralpop</strong>. Al crear una cuenta y utilizar nuestros servicios, aceptas cumplir con estas condiciones en su totalidad.
                    </p>

                    <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">1. Uso del Servicio</h3>
                    <p>
                        Ruralpop funciona como una plataforma de contacto (tablón de anuncios clasificados). No participamos directamente en las transacciones de compra/venta entre los usuarios, ni somos responsables del estado, legalidad o calidad de los bienes anunciados. Todo acuerdo se realiza bajo la estricta responsabilidad del vendedor y el comprador.
                    </p>

                    <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">2. Anuncios y Contenido</h3>
                    <p>Al publicar un anuncio, usted garantiza que:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Es propietario legítimo o está debidamente autorizado para vender el artículo o animal.</li>
                        <li>Las fotografías y descripciones son veraces y corresponden al estado actual del artículo.</li>
                        <li>Cumple con toda la legalidad vigente autonómica y nacional, prestando especial atención a la normativa de trazabilidad y bienestar animal (guías ganaderas, cartillas, REGA).</li>
                        <li>No publicará artículos prohibidos por la ley.</li>
                    </ul>
                    <p>Nos reservamos el derecho de eliminar automáticamente contenido que consideremos inapropiado o fraudulento en protección de nuestra comunidad.</p>

                    <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">3. Responsabilidades</h3>
                    <p>
                        Ruralpop no se hace responsable de las disputas generadas en transacciones entre usuarios y queda excluida de indemnizaciones derivadas por artículos defectuosos, pagos incompletos o fraudes. Instamos a los usuarios a usar el sentido común, revisar presencialmente máquinas/ganado y no enviar dinero por adelantado sin garantías.
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Página de términos y condiciones creada para resolver el 404 del footer.
 * - Basada en las directrices de responsabilidad neutra de plataformas C2C.
 */
