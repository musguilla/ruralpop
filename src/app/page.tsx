export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-full py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">
          Bienvenido a <span className="text-[var(--ag-sys-color-primary)]">Ruralpop</span>
        </h1>
        <p className="text-xl text-[var(--ag-sys-color-text-muted)]">
          El portal de anuncios clasificados diseñado exclusivamente para el sector agrícola y ganadero.
          Encuentra animales, maquinaria, y forraje al instante.
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <button className="px-6 py-3 bg-[var(--ag-sys-color-primary)] text-white font-medium rounded-full hover:bg-[var(--ag-sys-color-primary-hover)] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ag-sys-color-primary)]">
            Explorar Anuncios
          </button>
          <button className="px-6 py-3 bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text)] border border-[var(--ag-sys-color-border)] font-medium rounded-full hover:border-[var(--ag-sys-color-primary)] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ag-sys-color-primary)]">
            Vende tus productos
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Memory / Decisiones Técnicas:
 * - Página de inicio limpia (Hero section).
 * - Uso estricto de tokens CSS vía variables de entorno.
 * - Sin uso de imágenes externas por el momento hasta la Fase 4.
 */
