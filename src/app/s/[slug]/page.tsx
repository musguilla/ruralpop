import { notFound } from "next/navigation";
import { SEO_LANDINGS } from "@/constants/seoLandings";
import { LOCATIONS } from "@/constants/locations";
import { Suspense } from "react";
import { ListingsGrid } from "@/components/ui/ListingsGrid";
import { ActiveSearchBar } from "@/components/ui/ActiveSearchBar";
import { ListingCardSkeleton } from "@/components/ui/ListingCard";
import type { Metadata } from "next";
import { parseSeoUrl } from "@/utils/seoUtils";
import { DynamicSeoBlock } from "@/components/seo/DynamicSeoBlock";
import { DynamicFaqs } from "@/components/seo/DynamicFaqs";
import { headers } from "next/headers";
import { LocaleCode } from "@/i18n/config";
import { generateSeoH1 } from "@/utils/h1Generator";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const params = await props.params;
    const landing = SEO_LANDINGS.find(l => l.slug === params.slug);

    if (!landing) return {};

    const seoVariations = [
        "Comprar y vender ganado",
        "Compraventa de animales ganaderos",
        "App gratis compraventa ganado",
        "Anuncios gratis del campo",
        "Mercado rural de segunda mano",
        "Compra venta ganadería"
    ];

    const headersList = await headers();
    const locale = (headersList.get('x-locale') || 'es') as LocaleCode;

    let baseTitle = landing.title;
    if (locale === 'pt') {
        const combinedParams: any = {};
        if (landing.searchQuery) combinedParams.q = landing.searchQuery;
        if (landing.category) combinedParams.category = landing.category;
        if (landing.subcategory) combinedParams.subcategory = landing.subcategory;
        baseTitle = generateSeoH1(combinedParams, landing.province, locale);
    }

    let pageTitle = `${baseTitle} | Ruralpop`;
    if (locale === 'es') {
        const charCodeSum = params.slug.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const suffix = seoVariations[charCodeSum % seoVariations.length];
        const candidateTitle = `${baseTitle} - ${suffix} | Ruralpop`;

        // Maximize title length for Google (usually up to ~65-70 chars)
        if (candidateTitle.length <= 72) {
            pageTitle = candidateTitle;
        }
    }

    // Making the description even more punchy and keyword rich
    let optimizedDescription = `Descubre los mejores anuncios de ${baseTitle.toLowerCase()} en nuestra App gratis. El gran mercado agrícola de España para descargar y buscar, comprar y vender ganado, vacas, toros, caballos, maquinaria y más.`;
    if (locale === 'pt') {
        optimizedDescription = `Descubra os melhores anúncios de ${baseTitle.toLowerCase()} na nossa App grátis. O grande mercado agrícola para descarregar e pesquisar, comprar e vender gado, vacas, touros, cavalos, máquinas e muito mais.`;
    }

    return {
        title: pageTitle,
        description: optimizedDescription,
        alternates: {
            canonical: `/s/${params.slug}`
        },
        openGraph: {
            title: pageTitle,
            description: optimizedDescription,
            type: "website"
        }
    };
}

export default async function SeoLandingPage(props: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    const landing = SEO_LANDINGS.find(l => l.slug === params.slug);
    if (!landing) {
        return notFound();
    }

    const combinedParams: { [key: string]: string | string[] | undefined } = {
        ...searchParams
    };

    if (landing.searchQuery) combinedParams.q = landing.searchQuery;
    if (landing.category) combinedParams.category = landing.category;
    if (landing.subcategory) combinedParams.subcategory = landing.subcategory;

    if (landing.province) {
        // Fallback temporal para llenar las nuevas landings con el inventario completo de tractores
        const isTemporaryFallback = [
            "tractores-segunda-mano-asturias", 
            "tractores-segunda-mano-galicia", 
            "tractores-usados-madrid", 
            "tractor-segunda-mano-bilbao", 
            "tractor-usado-valencia"
        ].includes(params.slug);

        if (!isTemporaryFallback) {
            // Find the province ID
            const prov = LOCATIONS.find(l => l.name === landing.province && l.type === 'province');
            if (prov) {
                combinedParams.province_id = prov.id;
            }
        }
    }

    const headersList = await headers();
    const locale = (headersList.get('x-locale') || 'es') as LocaleCode;

    let displayTitle = landing.title;
    let displaySubtitle = landing.subtitle || "Encuentra y compara las mejores ofertas de nuestro mercado agrícola.";

    if (locale === 'pt') {
        const combinedParams: any = {};
        if (landing.searchQuery) combinedParams.q = landing.searchQuery;
        if (landing.category) combinedParams.category = landing.category;
        if (landing.subcategory) combinedParams.subcategory = landing.subcategory;
        displayTitle = generateSeoH1(combinedParams, landing.province, locale);
        displaySubtitle = "Encontre e compare as melhores ofertas do nosso mercado agrícola.";
    }

    return (
        <div className="container mx-auto px-4 pt-0 pb-16 sm:py-8 min-h-screen">
            <Suspense fallback={<div className="h-16 w-full animate-pulse bg-[var(--ag-sys-color-surface)] mb-6" />}>
                <ActiveSearchBar />
            </Suspense>

            <div className="mb-10 text-center sm:text-left mt-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--ag-sys-color-text)] mb-3">{displayTitle}</h1>
                <p className="text-[var(--ag-sys-color-text-muted)] text-lg">{displaySubtitle}</p>
            </div>

            <Suspense fallback={<GridSkeleton />}>
                <ListingsGrid searchParams={combinedParams} />
            </Suspense>

            <Suspense fallback={<div className="h-48 w-full animate-pulse bg-[var(--ag-sys-color-surface)] mt-12 rounded-2xl" />}>
                <DynamicSeoBlock 
                    parsedSlug={combinedParams} 
                    locationName={landing.province} 
                    categoryQuery={landing.category || landing.searchQuery || landing.title} 
                />
            </Suspense>

            <Suspense fallback={null}>
                <DynamicFaqs 
                    categoryQuery={landing.category || landing.searchQuery || landing.title} 
                    provinceName={landing.province} 
                />
            </Suspense>

            {/* Related Searches for Tractores and Machinery */}
            {["tractores-segunda-mano", "segunda-mano-tractores", "comprar-maquinaria-agricola", "tractores-segunda-mano-asturias", "tractores-segunda-mano-galicia", "tractores-usados-madrid", "tractor-segunda-mano-bilbao", "tractor-usado-valencia"].includes(params.slug) && (
                <div className="mt-10 px-2 sm:px-4 flex flex-col sm:flex-row items-center sm:justify-start gap-4 text-center sm:text-left">
                    <span className="font-bold text-[var(--ag-sys-color-text)]">Más buscado</span>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                                {params.slug !== "tractores-segunda-mano" && (
                            <a href="https://www.ruralpop.com/s/tractores-segunda-mano" className="px-4 py-2 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-full text-sm font-medium hover:bg-black/5 transition-colors">
                                Tractores segunda mano
                            </a>
                        )}
                        {params.slug !== "segunda-mano-tractores" && (
                            <a href="https://www.ruralpop.com/s/segunda-mano-tractores" className="px-4 py-2 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-full text-sm font-medium hover:bg-black/5 transition-colors">
                                Segunda mano tractores
                            </a>
                        )}
                        {params.slug !== "comprar-maquinaria-agricola" && (
                            <a href="https://www.ruralpop.com/s/comprar-maquinaria-agricola" className="px-4 py-2 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-full text-sm font-medium hover:bg-black/5 transition-colors">
                                Comprar maquinaria agrícola
                            </a>
                        )}
                        {params.slug !== "tractores-segunda-mano-asturias" && (
                            <a href="https://www.ruralpop.com/s/tractores-segunda-mano-asturias" className="px-4 py-2 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-full text-sm font-medium hover:bg-black/5 transition-colors">
                                Tractores segunda mano Asturias
                            </a>
                        )}
                        {params.slug !== "tractores-segunda-mano-galicia" && (
                            <a href="https://www.ruralpop.com/s/tractores-segunda-mano-galicia" className="px-4 py-2 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-full text-sm font-medium hover:bg-black/5 transition-colors">
                                Tractores segunda mano Galicia
                            </a>
                        )}
                        {params.slug !== "tractores-usados-madrid" && (
                            <a href="https://www.ruralpop.com/s/tractores-usados-madrid" className="px-4 py-2 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-full text-sm font-medium hover:bg-black/5 transition-colors">
                                Tractores usados Madrid
                            </a>
                        )}
                        {params.slug !== "tractor-segunda-mano-bilbao" && (
                            <a href="https://www.ruralpop.com/s/tractor-segunda-mano-bilbao" className="px-4 py-2 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-full text-sm font-medium hover:bg-black/5 transition-colors">
                                Tractor segunda mano Bilbao
                            </a>
                        )}
                        {params.slug !== "tractor-usado-valencia" && (
                            <a href="https://www.ruralpop.com/s/tractor-usado-valencia" className="px-4 py-2 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-full text-sm font-medium hover:bg-black/5 transition-colors">
                                Tractor usado Valencia
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function GridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <ListingCardSkeleton key={i} />
            ))}
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se genera una landing SEO estática/dinámica mapeada por slug (ej: /s/venta-animales-de-granja).
 * - Injectamos la descripción larga y el bloque FAQs optimizado por la semántica HTML5 tras la paginación.
 * - Los metaetiquetas OpenGraph y title se rellenan automáticamente garantizando alta visibilidad.
 */
