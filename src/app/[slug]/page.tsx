import { Suspense } from "react";
import { ListingCardSkeleton } from "@/components/ui/ListingCard";
import { ActiveSearchBar } from "@/components/ui/ActiveSearchBar";
import { ListingsGrid } from "@/components/ui/ListingsGrid";
import { parseSeoUrl } from "@/utils/seoUtils";

export default async function SearchResultsPage(props: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    const parsedSlug = parseSeoUrl(params.slug);

    // Merge parsed slug with query params (e.g. page, price_min, price_max)
    const combinedParams: { [key: string]: string | string[] | undefined } = {
        ...searchParams
    };

    if (parsedSlug.q) combinedParams.q = parsedSlug.q;
    if (parsedSlug.category) combinedParams.category = parsedSlug.category;
    if (parsedSlug.subcategory) combinedParams.subcategory = parsedSlug.subcategory;
    if (parsedSlug.province_id) combinedParams.province_id = parsedSlug.province_id;

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <Suspense fallback={<div className="h-16 w-full animate-pulse bg-[var(--ag-sys-color-surface)] mb-6" />}>
                <ActiveSearchBar />
            </Suspense>

            <Suspense fallback={<GridSkeleton />}>
                <ListingsGrid searchParams={combinedParams} />
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
