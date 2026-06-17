import Link from 'next/link';

export const metadata = {
  title: 'Página no encontrada | Ruralpop',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--ag-sys-color-background)] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-6xl font-black text-[var(--ag-sys-color-text)]">404</h1>
        <h2 className="text-2xl font-bold text-[var(--ag-sys-color-text-muted)]">
          Página no encontrada
        </h2>
        <p className="text-[var(--ag-sys-color-text-muted)]">
          Lo sentimos, la página que buscas no existe o ha sido movida. Si estabas navegando por páginas de anuncios, es posible que esos anuncios ya no estén disponibles.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-[var(--ag-sys-color-primary)] text-white font-bold hover:opacity-90 transition-opacity"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
