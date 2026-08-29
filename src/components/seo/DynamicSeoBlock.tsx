import { headers } from 'next/headers';
import React from 'react';
import { getCatalogSeoData } from '@/utils/seoCatalogUtils';
import { getServerTenantSlug } from "@/utils/tenant/server";

interface SeoBlockProps {
    parsedSlug: any;
    locationName?: string;
    categoryQuery: string;
}

export async function DynamicSeoBlock({ parsedSlug, locationName, categoryQuery }: SeoBlockProps) {
    const headersList = await headers();
    const locale = headersList.get("x-locale") || "es";
    const { count, tags } = await getCatalogSeoData(parsedSlug);
    
    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';
    const displayCategory = categoryQuery.replace(/-/g, ' ');

    // Si no hay apenas anuncios, no mostramos el bloque SEO, ya que sin enlaces quedaba vacío ("... en ...")
    if (count === 0) {
        return null;
    }

    // Full SEO Block (>= 1 Ad)
    const locText = locationName ? ` en ${locationName}` : ' online';
    const tagText = tags.length > 0 ? `Entre los anuncios más destacados, frecuentemente encontraras opciones relacionadas con ${tags.slice(0, 4).join(', ')}.` : '';

    const brand = isEquipop ? 'Equipop' : 'Ruralpop';
    const sellersText = isEquipop ? 'jinetes y tiendas especializadas' : 'vendedores, agricultores y ganaderos';

    return (
        <div className="w-full mt-24 bg-[var(--ag-sys-color-surface)] p-6 sm:p-10 rounded-3xl border border-[var(--ag-sys-color-border)] shadow-sm">
            <h2 className="text-2xl font-extrabold text-[var(--ag-sys-color-text)] mb-4">
                Comprar y Vender {displayCategory}{locText}
            </h2>
            
            <p className="text-[var(--ag-sys-color-text-muted)] text-lg mb-4 leading-relaxed">
                Encuentra las mejores oportunidades de <strong className="font-bold text-[var(--ag-sys-color-text)]">{displayCategory.toLowerCase()}</strong> gracias a nuestros clasificados actualizados diariamente. {brand} es el punto de encuentro ideal para contactar directamente con {sellersText} de confianza sin intermediarios.
            </p>
            
            <p className="text-[var(--ag-sys-color-text-muted)] text-lg mb-4 leading-relaxed">
                Disponemos de una amplia variedad adaptada a lo que necesitas. {tagText} Compara precios reales, revisa la descripción de cada ficha y abre un chat directo para cerrar la compra garantizando siempre el mejor acuerdo.
            </p>
        </div>
    );
}
