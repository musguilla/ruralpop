export const metadata = {
    title: "Importación Anuncios | Admin Ruralpop"
};

export default function MarketingImportPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] mb-2">Importación de Anuncios</h1>
            <p className="text-[var(--ag-sys-color-text-muted)] mb-8">
                Configura fuentes de datos externas para scrapear y rellenar Ruralpop con contenido inicial.
            </p>

            <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl p-6 md:p-8 w-full">
                <form className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-[var(--ag-sys-color-text)] mb-2">Fuente de Datos</label>
                        <select className="w-full h-12 px-4 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition-all">
                            <option value="milanuncios">Milanuncios</option>
                            <option value="wallapop">Wallapop</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[var(--ag-sys-color-text)] mb-2">URL de origen</label>
                        <input
                            type="url"
                            placeholder="https://www.milanuncios.com/ganado/"
                            className="w-full h-12 px-4 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[var(--ag-sys-color-text)] mb-2">Número de registros a importar</label>
                        <input
                            type="number"
                            defaultValue={50}
                            min={1}
                            max={500}
                            className="w-full h-12 px-4 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition-all"
                        />
                    </div>

                    <button
                        type="button"
                        className="w-full h-12 mt-4 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-all opacity-50 cursor-not-allowed text-sm"
                        disabled
                    >
                        Iniciar Importación (Próximamente)
                    </button>
                </form>
            </div>
        </div>
    );
}
