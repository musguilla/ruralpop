"use client";

import Link from 'next/link';
import { useTranslation } from '@/context/LocaleContext';

export default function NotFound() {
  const { locale } = useTranslation();
  const isPt = locale === 'pt';

  return (
    <div className="min-h-screen bg-[var(--ag-sys-color-background)] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-6xl font-black text-[var(--ag-sys-color-text)]">404</h1>
        <h2 className="text-2xl font-bold text-[var(--ag-sys-color-text-muted)]">
          {isPt ? "Página não encontrada" : "Página no encontrada"}
        </h2>
        <p className="text-[var(--ag-sys-color-text-muted)]">
          {isPt 
            ? "Lamentamos, mas a página que procura não existe ou foi movida. Se estava a pesquisar anúncios, é possível que já não estejam disponíveis." 
            : "Lo sentimos, la página que buscas no existe o ha sido movida. Si estabas navegando por páginas de anuncios, es posible que esos anuncios ya no estén disponibles."}
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-[var(--ag-sys-color-primary)] text-white font-bold hover:opacity-90 transition-opacity"
        >
          {isPt ? "Voltar ao início" : "Volver al inicio"}
        </Link>
      </div>
    </div>
  );
}
