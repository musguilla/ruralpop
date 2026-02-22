export const metadata = {
    title: "Importación Anuncios | Admin Ruralpop"
};

import { ImportForm } from "./ImportForm";

export default function MarketingImportPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] mb-2">Importación de Anuncios</h1>
            <p className="text-[var(--ag-sys-color-text-muted)] mb-8">
                Configura fuentes de datos externas para scrapear y rellenar Ruralpop con contenido inicial.
            </p>

            <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl p-6 md:p-8 w-full">
                <ImportForm />
            </div>
        </div>
    );
}
