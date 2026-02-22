export const metadata = {
    title: "Social Media | Admin Ruralpop"
};

export default function MarketingSocialPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] mb-2">Social Media</h1>
            <p className="text-[var(--ag-sys-color-text-muted)] mb-8">
                Publica y programa posts en las redes sociales de Ruralpop.
            </p>

            <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl p-16 text-center text-[var(--ag-sys-color-text-muted)]">
                <p className="font-bold text-lg mb-2">Integración en Desarrollo</p>
                <p>Próximamente podrás conectar cuentas de Instagram, Facebook y automatizar tus listados aquí.</p>
            </div>
        </div>
    );
}
