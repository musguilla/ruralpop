import { Suspense } from "react";
import type { Metadata } from "next";
import { ListingCardSkeleton } from "@/components/ui/ListingCard";
import { ActiveSearchBar } from "@/components/ui/ActiveSearchBar";
import { ListingsGrid } from "@/components/ui/ListingsGrid";
import { parseSeoUrl, buildSeoUrl } from "@/utils/seoUtils";
import { LOCATIONS } from "@/constants/locations";
import { notFound } from "next/navigation";
import { DynamicSeoBlock } from "@/components/seo/DynamicSeoBlock";
import { DynamicFaqs } from "@/components/seo/DynamicFaqs";
import { BovineRelatedLinks } from "@/components/seo/BovineRelatedLinks";
import { SeoBreadcrumbs } from "@/components/seo/SeoBreadcrumbs";
import { generateSeoH1 } from "@/utils/h1Generator";

import { headers } from "next/headers";
import { getHreflangLinks, getCanonicalUrl } from "@/i18n/utils";
import { LocaleCode } from "@/i18n/config";
import { getServerTenantSlug } from "@/utils/tenant/server";

export async function generateMetadata(props: { 
    params: Promise<{ slug: string | string[] }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const parsed = parseSeoUrl(params.slug);
    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';
    const headersList = await headers();
    const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
    const slugStr = Array.isArray(params.slug) ? params.slug.join("/") : params.slug;
    const originalPathname = headersList.get('x-original-pathname') || `/${slugStr}`;

    let locationName = "";
    if (parsed.province_id) {
        const loc = LOCATIONS.find(l => l.id === parsed.province_id);
        if (loc) locationName = loc.name;
    }

    const isPt = locale === 'pt';

    // We can use generateSeoH1 to get a perfectly translated base subject
    // generateSeoH1 already appends the location correctly (en/em)
    const baseSubject = generateSeoH1(parsed, locationName, locale);

    const isLocationOnly = !parsed.q && !parsed.subcategory && !parsed.category && locationName !== "";

    let pageTitle = isEquipop 
        ? (isPt ? "Material equestre em segunda mão | Equipop" : "Material de equitación de segunda mano | Equipop")
        : (isPt ? "Mercado Agrícola e Pecuário | Ruralpop" : "Mercado Agrícola y Ganadero | Ruralpop");

    if (isLocationOnly) {
        const charCodeSumLoc = (Array.isArray(params.slug) ? params.slug.join("/") : params.slug).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const variations = isEquipop 
            ? (isPt 
                ? [`Equitação em ${locationName} - Material equestre`, `Cavalos e selas em ${locationName} - Equipop`]
                : [`Equitación en ${locationName} - Material ecuestre`, `Caballos y monturas en ${locationName} - Equipop`])
            : (isPt 
                ? [`Pecuária em ${locationName} - Comprar e vender gado`, `Gado à venda em ${locationName} - Vender gado ${locationName}`]
                : [`Ganadería en ${locationName} - Comprar y vender ganado`, `Ganado en venta en ${locationName} - Vender ganado ${locationName}`]);
        pageTitle = variations[charCodeSumLoc % 2];
    } else if (baseSubject.trim() && baseSubject !== generateSeoH1({}, locationName, locale)) {
        const seoVariations = isEquipop
            ? (isPt 
                ? ["Material equestre usado", "App grátis equitação", "Loja hípica segunda mão", "Artigos para cavalo", "Tudo para o seu cavalo", "Equipamento para cavaleiros"]
                : ["Material ecuestre usado", "App gratis equitación", "Tienda hípica segunda mano", "Artículos para el caballo", "Todo para tu caballo", "Equipamiento para jinetes"])
            : (isPt 
                ? ["Comprar e vender gado", "Compra e venda de animais", "App grátis compra e venda gado", "Anúncios grátis do campo", "Mercado rural de segunda mão", "Compra e venda de gado"]
                : ["Comprar y vender ganado", "Compraventa de animales ganaderos", "App gratis compraventa ganado", "Anuncios gratis del campo", "Mercado rural de segunda mano", "Compra venta ganadería"]);
        const charCodeSum = (Array.isArray(params.slug) ? params.slug.join("/") : params.slug).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const suffix = seoVariations[charCodeSum % seoVariations.length];
        
        const brand = isEquipop ? "Equipop" : "Ruralpop";
        const candidateTitle = `${baseSubject} - ${suffix} | ${brand}`;
        if (candidateTitle.length > 72) {
            pageTitle = `${baseSubject} | ${brand}`;
        } else {
            pageTitle = candidateTitle;
        }
    }

    let canonical = getCanonicalUrl(originalPathname, locale);
    const isPaginated = searchParams.page && typeof searchParams.page === 'string' && searchParams.page !== '1';
    
    if (isPaginated) {
        canonical += `?page=${searchParams.page}`;
    }

    let robotsRules: any = undefined;
    if (isPaginated) {
        robotsRules = { index: false, follow: true };
    }
    
    const descText = isEquipop
        ? (isPt
            ? `App grátis para ${baseSubject || "pesquisar material equestre"}. Compre e venda selas, botas, acessórios e tudo o que precisa para o seu cavalo sem comissões na Equipop.`
            : `App gratis para ${baseSubject || "buscar material ecuestre"}. Compra y vende monturas, botas, accesorios y todo lo necesario para tu caballo sin comisiones en Equipop.`)
        : (isPt
            ? `App grátis para ${baseSubject || "procurar ofertas"}. Descarregue a melhor app para anunciar, vender e comprar gado, vacas, touros, galinhas, éguas, cavalos, máquinas e forragem sem comissões. Anúncios 100% classificados rurais.`
            : `Aplicación gratis para ${baseSubject || "buscar ofertas"}. Descarga la mejor app para anunciar, vender y comprar ganado, vacas, toros, gallinas, yeguas, caballos, maquinaria y forraje sin comisiones. Anuncios 100% clasificados de campo.`);

    return {
        title: pageTitle,
        description: descText,
        alternates: {
            canonical,
            languages: getHreflangLinks(originalPathname)
        },
        robots: robotsRules
    };
}

export default async function SearchResultsPage(props: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await props.params;
    const headersList = await headers();
    const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
    
    // Explicit protection against catching known folders if the dev server hasn't hot-reloaded the tree perfectly
    const reservedRoutes = ['tienda', 'checkout', 'admin', 'auth', 'favoritos'];
    if (reservedRoutes.includes(Array.isArray(params.slug) ? params.slug.join("/") : params.slug)) {
        notFound();
    }

    const searchParams = await props.searchParams;

    const parsedSlug = parseSeoUrl(params.slug);

    let locationName = "";
    if (parsedSlug.province_id) {
        const loc = LOCATIONS.find(l => l.id === parsedSlug.province_id);
        if (loc) locationName = loc.name;
    }

    // Merge parsed slug with query params (e.g. page, price_min, price_max)
    const combinedParams: { [key: string]: string | string[] | undefined } = {
        ...searchParams
    };

    if (parsedSlug.q) combinedParams.q = parsedSlug.q;
    if (parsedSlug.category) combinedParams.category = parsedSlug.category;
    if (parsedSlug.subcategory) combinedParams.subcategory = parsedSlug.subcategory;
    if (parsedSlug.province_id) combinedParams.province_id = parsedSlug.province_id;

    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';
    const brandName = isEquipop ? "Equipop" : "Ruralpop";

    return (
        <div className="container mx-auto px-4 pt-0 pb-8 sm:py-8 min-h-screen">
            <SeoBreadcrumbs parsedSlug={parsedSlug} locationName={locationName} locale={locale} brandName={brandName} />
            <h1 className="text-lg md:text-xl font-bold text-[var(--ag-sys-color-text)] mb-2 pt-2 sm:pt-0">
                {generateSeoH1(parsedSlug, locationName, locale)}
            </h1>

            <Suspense fallback={<div className="h-16 w-full animate-pulse bg-[var(--ag-sys-color-surface)] mb-6" />}>
                <ActiveSearchBar />
            </Suspense>

            <Suspense fallback={<GridSkeleton />}>
                <ListingsGrid searchParams={combinedParams} />
            </Suspense>

            <Suspense fallback={null}>
                <BovineRelatedLinks parsedSlug={parsedSlug} />
            </Suspense>

            <Suspense fallback={<div className="h-48 w-full animate-pulse bg-[var(--ag-sys-color-surface)] mt-12 rounded-2xl" />}>
                <DynamicSeoBlock 
                    parsedSlug={parsedSlug} 
                    locationName={locationName} 
                    categoryQuery={parsedSlug.subcategory || parsedSlug.category || parsedSlug.q || "anuncios"} 
                />
            </Suspense>

            <Suspense fallback={null}>
                <DynamicFaqs 
                    categoryQuery={parsedSlug.subcategory || parsedSlug.category || parsedSlug.q || "anuncios"} 
                    provinceName={locationName} 
                />
            </Suspense>
        </div>
    );
}

function GridSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <ListingCardSkeleton key={i} />
            ))}
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se utiliza una ruta dinámica `[slug]` en la raíz para capturar URLs SEO friendly (ej. /vaca-ganaderia-bovino-zamora).
 * - Se extraen los parámetros usando `parseSeoUrl` y se combinan con los `searchParams` tradicionales (para paginación, precios).
 * - Las rutas estáticas preexistentes (como /login, /dashboard) tienen prioridad en Next.js App Router, evitando colisiones graves.
 */
