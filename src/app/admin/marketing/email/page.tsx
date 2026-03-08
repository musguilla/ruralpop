import React from "react";
import { Mail, Wrench } from "lucide-react";

export default function AdminEmailMarketingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <div className="w-24 h-24 bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] rounded-full flex items-center justify-center mb-6 border border-[var(--ag-sys-color-primary)]/20 shadow-xl shadow-[var(--ag-sys-color-primary)]/5">
                <Mail className="w-12 h-12" />
            </div>

            <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] mb-3 tracking-tight">
                Email Marketing
            </h1>

            <p className="text-[var(--ag-sys-color-text-muted)] max-w-md text-lg font-medium leading-relaxed mb-8">
                Estamos construyendo este apartado para que puedas gestionar campañas de correo, automatizaciones y enviar newsletters masivas a los usuarios de Ruralpop.
            </p>

            <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl px-6 py-3 inline-flex items-center gap-3 shadow-sm">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--ag-sys-color-primary)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--ag-sys-color-primary)]"></span>
                </span>
                <span className="text-sm font-bold tracking-widest uppercase text-[var(--ag-sys-color-text)]">
                    Próximamente
                </span>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Placeholder elegante para la futura sección de Email Marketing alineado al diseño de Sistema > Configuración.
 */
