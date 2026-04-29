import React from 'react';
import Link from 'next/link';
import { NEIGHBORING_PROVINCES } from '@/constants/neighboringProvinces';
import { getCatalogSeoData } from '@/utils/seoCatalogUtils';
import { LOCATIONS } from '@/constants/locations';
import { buildSeoUrl } from '@/utils/seoUtils';

interface SeoBlockProps {
    parsedSlug: any;
    locationName?: string;
    categoryQuery: string;
}

export async function DynamicSeoBlock({ parsedSlug, locationName, categoryQuery }: SeoBlockProps) {
    const { count, tags } = await getCatalogSeoData(parsedSlug);

    // Si no hay apenas anuncios, mostramos un bloque muy recortado.
    if (count === 0) {
        return (
            <div className="w-full mt-16 bg-[var(--ag-sys-color-surface)] p-6 sm:p-10 rounded-3xl border border-[var(--ag-sys-color-border)] shadow-sm text-center">
                <h2 className="text-2xl font-extrabold text-[var(--ag-sys-color-text)] mb-4">Encuentra más resultados</h2>
                <p className="text-[var(--ag-sys-color-text-muted)] text-lg mb-6">
                    También puedes encontrar anuncios de {categoryQuery} {locationName ? `en ${locationName}` : ''} en ...
                </p>
                {locationName && NEIGHBORING_PROVINCES[locationName] && (
                    <div>
                        <h3 className="font-bold text-[var(--ag-sys-color-text)] mb-3">Quizás te interese buscar en provincias cercanas:</h3>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {NEIGHBORING_PROVINCES[locationName].slice(0, 4).map(neighbor => {
                                const neighborLoc = LOCATIONS.find(l => l.name === neighbor);
                                const neighborUrl = buildSeoUrl({
                                    q: parsedSlug.q,
                                    category: parsedSlug.category,
                                    subcategory: parsedSlug.subcategory,
                                    province_id: neighborLoc ? neighborLoc.id : undefined
                                });

                                return (
                                    <Link 
                                        key={neighbor}
                                        href={neighborUrl}
                                        className="px-4 py-2 bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] rounded-full text-sm font-medium hover:bg-[var(--ag-sys-color-primary)]/10 hover:text-[var(--ag-sys-color-primary)] hover:border-[var(--ag-sys-color-primary)] transition-all"
                                    >
                                        {neighbor}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Full SEO Block (>= 1 Ad)
    const locText = locationName ? ` en ${locationName}` : ' online';
    const tagText = tags.length > 0 ? `Entre los anuncios más destacados, frecuentemente encontraras opciones relacionadas con ${tags.slice(0, 4).join(', ')}.` : '';

    return (
        <div className="w-full mt-24 bg-[var(--ag-sys-color-surface)] p-6 sm:p-10 rounded-3xl border border-[var(--ag-sys-color-border)] shadow-sm">
            <h2 className="text-2xl font-extrabold text-[var(--ag-sys-color-text)] mb-4">
                Comprar y Vender {categoryQuery}{locText}
            </h2>
            
            <p className="text-[var(--ag-sys-color-text-muted)] text-lg mb-4 leading-relaxed">
                Encuentra las mejores oportunidades de <strong className="font-bold text-[var(--ag-sys-color-text)]">{categoryQuery.toLowerCase()}</strong> gracias a nuestros clasificados actualizados diariamente. Ruralpop es el punto de encuentro ideal para contactar directamente con vendedores, agricultores y ganaderos de confianza sin intermediarios.
            </p>
            
            <p className="text-[var(--ag-sys-color-text-muted)] text-lg mb-4 leading-relaxed">
                Disponemos de una amplia variedad adaptada a lo que necesitas. {tagText} Compara precios reales, revisa la descripción de cada ficha y abre un chat directo para cerrar la compra garantizando siempre el mejor acuerdo.
            </p>

            {locationName && NEIGHBORING_PROVINCES[locationName] && (
                <div className="mt-8 pt-6 border-t border-[var(--ag-sys-color-border)]">
                    <h3 className="font-bold text-[var(--ag-sys-color-text)] mb-3">Amplía tu zona de búsqueda a provincias cercanas:</h3>
                    <div className="flex flex-wrap gap-2">
                        {NEIGHBORING_PROVINCES[locationName].slice(0, 4).map(neighbor => {
                            const neighborLoc = LOCATIONS.find(l => l.name === neighbor);
                            const neighborUrl = buildSeoUrl({
                                q: parsedSlug.q,
                                category: parsedSlug.category,
                                subcategory: parsedSlug.subcategory,
                                province_id: neighborLoc ? neighborLoc.id : undefined
                            });

                            return (
                                <Link 
                                    key={neighbor}
                                    href={neighborUrl}
                                    className="text-[var(--ag-sys-color-primary)] font-semibold hover:underline mr-3"
                                >
                                    {categoryQuery} en {neighbor}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
