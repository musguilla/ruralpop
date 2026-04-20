import { Suspense } from "react";
import type { Metadata } from "next";
import { ListingCardSkeleton } from "@/components/ui/ListingCard";
import { ActiveSearchBar } from "@/components/ui/ActiveSearchBar";
import { ListingsGrid } from "@/components/ui/ListingsGrid";
import { parseSeoUrl } from "@/utils/seoUtils";
import { LOCATIONS } from "@/constants/locations";
import { notFound } from "next/navigation";
import { DynamicSeoBlock } from "@/components/seo/DynamicSeoBlock";
import { DynamicFaqs } from "@/components/seo/DynamicFaqs";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const params = await props.params;
    const parsed = parseSeoUrl(params.slug);

    let locationName = "";
    if (parsed.province_id) {
        const loc = LOCATIONS.find(l => l.id === parsed.province_id);
        if (loc) locationName = loc.name;
    }

    const qLabel = parsed.q ? parsed.q.charAt(0).toUpperCase() + parsed.q.slice(1) : "";
    const subLabel = parsed.subcategory ? parsed.subcategory.charAt(0).toUpperCase() + parsed.subcategory.slice(1) : "";
    const catLabel = parsed.category ? parsed.category.charAt(0).toUpperCase() + parsed.category.slice(1) : "";

    const parts = [];
    if (qLabel) parts.push(qLabel);
    if (subLabel) parts.push(subLabel);
    else if (catLabel && !qLabel) parts.push(catLabel);

    if (locationName) parts.push(`en ${locationName}`);

    const baseSubject = parts.join(" ");

    const seoVariations = [
        "Comprar y vender ganado",
        "Compraventa de animales ganaderos",
        "App gratis compraventa ganado",
        "Anuncios gratis del campo",
        "Mercado rural de segunda mano",
        "Compra venta ganadería"
    ];

    const charCodeSum = params.slug.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const suffix = seoVariations[charCodeSum % seoVariations.length];

    let pageTitle = "Mercado Agrícola y Ganadero | Ruralpop";
    if (baseSubject.trim()) {
        const candidateTitle = `${baseSubject} - ${suffix} | Ruralpop`;
        // Google usually displays up to ~65 characters. Only attach the suffix if it reasonably fits.
        if (candidateTitle.length > 72) {
            pageTitle = `${baseSubject} | Ruralpop`;
        } else {
            pageTitle = candidateTitle;
        }
    }

    return {
        title: pageTitle,
        description: `Aplicación gratis para ${parts.join(" ") || "buscar ofertas"}. Descarga la mejor app para anunciar, vender y comprar ganado, vacas, toros, gallinas, yeguas, caballos, maquinaria y forraje sin comisiones. Anuncios 100% clasificados de campo.`,
        alternates: {
            canonical: `/${params.slug}`
        }
    };
}

export default async function SearchResultsPage(props: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await props.params;
    
    // Explicit protection against catching known folders if the dev server hasn't hot-reloaded the tree perfectly
    const reservedRoutes = ['tienda', 'checkout', 'admin', 'auth', 'favoritos'];
    if (reservedRoutes.includes(params.slug)) {
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

    return (
        <div className="container mx-auto px-4 pt-0 pb-8 sm:py-8 min-h-screen">
            <Suspense fallback={<div className="h-16 w-full animate-pulse bg-[var(--ag-sys-color-surface)] mb-6" />}>
                <ActiveSearchBar />
            </Suspense>

            <Suspense fallback={<GridSkeleton />}>
                <ListingsGrid searchParams={combinedParams} />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
