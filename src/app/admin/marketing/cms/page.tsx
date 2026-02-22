export const metadata = {
    title: "CMS | Admin Ruralpop"
};

export default function MarketingCMSPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] mb-2">Editor CMS</h1>
            <p className="text-[var(--ag-sys-color-text-muted)] mb-8">
                Crea nuevas páginas de contenido y artículos para el blog para atrapar tráfico SEO.
            </p>

            <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl p-16 text-center text-[var(--ag-sys-color-text-muted)] w-full">
                <p className="font-bold text-lg mb-2">CMS en Desarrollo</p>
                <p>Próximamente podrás crear y publicar landings ricas en componentes y blogs desde este panel.</p>
            </div>
        </div>
    );
}
