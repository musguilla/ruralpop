import { headers } from 'next/headers';
import React from 'react';
import { getCatalogSeoData } from '@/utils/seoCatalogUtils';
import { getServerTenantSlug } from "@/utils/tenant/server";
import { getLocalizedCategoryName, getLocalizedLocationText } from '@/utils/seoBlockLocalization';

interface SeoBlockProps {
    parsedSlug: {
        category?: string;
        subcategory?: string;
        province_id?: string;
        q?: string;
    };
    locationName?: string;
    categoryQuery: string;
}

export async function DynamicSeoBlock({ parsedSlug, locationName, categoryQuery }: SeoBlockProps) {
    const headersList = await headers();
    const locale = headersList.get("x-locale") || "es";
    const isPt = locale === "pt";
    const { count, tags } = await getCatalogSeoData(parsedSlug);
    
    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';
    const displayCategory = getLocalizedCategoryName(categoryQuery, locale);
    const cTitle = displayCategory.charAt(0).toUpperCase() + displayCategory.slice(1);

    // Si no hay apenas anuncios, no mostramos el bloque SEO, ya que sin enlaces quedaba vacío ("... en ...")
    if (count === 0) {
        return null;
    }

    // Full SEO Block (>= 1 Ad)
    const locText = getLocalizedLocationText(locationName, locale);
    const tagText = tags.length > 0 
        ? (isPt 
            ? `Entre os anúncios em destaque, frequentemente encontrará opções relacionadas com ${tags.slice(0, 4).join(', ')}.` 
            : `Entre los anuncios más destacados, frecuentemente encontraras opciones relacionadas con ${tags.slice(0, 4).join(', ')}.`)
        : '';

    const brand = isEquipop ? 'Equipop' : 'Ruralpop';
    const sellersText = isPt
        ? (isEquipop ? 'cavaleiros e lojas especializadas' : 'vendedores, agricultores e produtores pecuários')
        : (isEquipop ? 'jinetes y tiendas especializadas' : 'vendedores, agricultores y ganaderos');

    return (
        <div className="w-full mt-24 bg-[var(--ag-sys-color-surface)] p-6 sm:p-10 rounded-3xl border border-[var(--ag-sys-color-border)] shadow-sm">
            <h2 className="text-2xl font-extrabold text-[var(--ag-sys-color-text)] mb-4">
                {isPt ? `Comprar e Vender ${cTitle}${locText}` : `Comprar y Vender ${cTitle}${locText}`}
            </h2>
            
            <p className="text-[var(--ag-sys-color-text-muted)] text-lg mb-4 leading-relaxed">
                {isPt ? (
                    <>
                        Encontre as melhores oportunidades de <strong className="font-bold text-[var(--ag-sys-color-text)]">{displayCategory.toLowerCase()}</strong> graças aos nossos classificados atualizados diariamente. {brand} é o ponto de encontro ideal para contactar diretamente com {sellersText} de confiança sem intermediários.
                    </>
                ) : (
                    <>
                        Encuentra las mejores oportunidades de <strong className="font-bold text-[var(--ag-sys-color-text)]">{displayCategory.toLowerCase()}</strong> gracias a nuestros clasificados actualizados diariamente. {brand} es el punto de encuentro ideal para contactar directamente con {sellersText} de confianza sin intermediarios.
                    </>
                )}
            </p>
            
            <p className="text-[var(--ag-sys-color-text-muted)] text-lg mb-4 leading-relaxed">
                {isPt ? (
                    <>
                        Dispomos de uma ampla variedade adaptada ao que procura. {tagText} Compare preços reais, reveja a descrição de cada ficha e abra uma conversa direta por chat para fechar o negócio garantindo sempre o melhor acordo.
                    </>
                ) : (
                    <>
                        Disponemos de una amplia variedad adaptada a lo que necesitas. {tagText} Compara precios reales, revisa la descripción de cada ficha y abre un chat directo para cerrar la compra garantizando siempre el mejor acuerdo.
                    </>
                )}
            </p>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Soporte multilingüe completo (ES / PT): localiza títulos, nombres de categoría y llamadas a la acción.
 * - En Portugal (.PT) se traduce el encabezado ("Comprar e Vender"), el cuerpo de texto descriptivo y
 *   las etiquetas dinámicas, usando gramática formal pt-PT nativa.
 * - Tipado estricto en 'parsedSlug' para eliminar cualquier rastro de 'any'.
 */
