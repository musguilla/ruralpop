import React from "react";
import EmailClientView from "./EmailClientView";
import { getServerTenantSlug } from "@/utils/tenant/server";

export default async function AdminEmailMarketingPage() {
    const tenant = await getServerTenantSlug();
    
    return (
        <div className="flex flex-col min-h-[70vh] px-4">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] mb-2 tracking-tight">
                    Email Marketing
                </h1>
                <p className="text-[var(--ag-sys-color-text-muted)] text-lg font-medium leading-relaxed">
                    Gestiona y envía campañas de correo utilizando las plantillas de {tenant === 'equipop' ? 'Equipop' : 'Ruralpop'}.
                </p>
            </div>

            <EmailClientView tenant={tenant} />
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se separa la lógica interactiva al EmailClientView para mantener este page.tsx minimalista como RSC.
 */
