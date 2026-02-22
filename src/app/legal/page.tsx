"use client";

import React from "react";
import { Scale } from "lucide-react";

export default function LegalPage() {
    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-[2rem] p-8 sm:p-12 shadow-sm">
                <header className="mb-8 border-b border-[var(--ag-sys-color-border)] pb-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] rounded-full flex items-center justify-center shrink-0">
                        <Scale className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">Aviso Legal</h1>
                        <p className="text-[var(--ag-sys-color-text-muted)] mt-1 font-medium">Información legal de Ruralpop</p>
                    </div>
                </header>

                <div className="prose prose-sm sm:prose-base max-w-none text-[var(--ag-sys-color-text)] leading-relaxed space-y-6">
                    <p>
                        En cumplimiento con el deber de información recogido en el artículo 10 de la Ley 34/2002 de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSICE), le informamos que la plataforma <strong>Ruralpop</strong> es un tablón de anuncios digital para conectar compradores y vendedores en el sector primario.
                    </p>

                    <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">Propiedad Intelectual y Contenido</h3>
                    <p>
                        El diseño del portal y sus códigos fuente, así como los logos, marcas y demás signos distintivos que aparecen en el mismo pertenecen a Ruralpop y están protegidos por los correspondientes derechos de propiedad intelectual e industrial.
                    </p>

                    <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">Exención de Responsabilidad</h3>
                    <p>
                        Ruralpop no se hace responsable de la legalidad de otros sitios web de terceros desde los que pueda accederse al portal. Ruralpop tampoco responde por la legalidad de otros sitios web de terceros, que pudieran estar vinculados o enlazados desde este portal. Ruralpop se reserva el derecho a realizar cambios en el sitio web sin previo aviso, al objeto de mantener actualizada su información, añadiendo, modificando, corrigiendo o eliminando los contenidos publicados o el diseño del portal.
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Página de Aviso Legal requerida por el footer.
 */
