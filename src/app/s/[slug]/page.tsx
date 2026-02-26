import { notFound } from "next/navigation";
import { SEO_LANDINGS } from "@/constants/seoLandings";
import { LOCATIONS } from "@/constants/locations";
import { Suspense } from "react";
import { ListingsGrid } from "@/components/ui/ListingsGrid";
import { ActiveSearchBar } from "@/components/ui/ActiveSearchBar";
import { ListingCardSkeleton } from "@/components/ui/ListingCard";
import type { Metadata } from "next";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const params = await props.params;
    const landing = SEO_LANDINGS.find(l => l.slug === params.slug);

    if (!landing) return {};

    return {
        title: `${landing.title} | Ruralpop`,
        description: landing.description,
        openGraph: {
            title: landing.title,
            description: landing.description,
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
        // Find the province ID
        const prov = LOCATIONS.find(l => l.name === landing.province && l.type === 'province');
        if (prov) {
            combinedParams.province_id = prov.id;
        }
    }

    return (
        <div className="container mx-auto px-4 pt-0 pb-16 sm:py-8 min-h-screen">
            <Suspense fallback={<div className="h-16 w-full animate-pulse bg-[var(--ag-sys-color-surface)] mb-6" />}>
                <ActiveSearchBar />
            </Suspense>

            <div className="mb-10 text-center sm:text-left mt-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--ag-sys-color-text)] mb-3">{landing.title}</h1>
                <p className="text-[var(--ag-sys-color-text-muted)] text-lg">Encuentra y compara las mejores ofertas de nuestro mercado agrícola.</p>
            </div>

            <Suspense fallback={<GridSkeleton />}>
                <ListingsGrid searchParams={combinedParams} />
            </Suspense>

            {/* SEO Content & FAQs (Full Width to match grid) */}
            <div className="w-full mt-24 bg-[var(--ag-sys-color-surface)] p-6 sm:p-10 rounded-3xl border border-[var(--ag-sys-color-border)] shadow-sm">
                <h2 className="text-2xl font-extrabold text-[var(--ag-sys-color-text)] mb-4">Sobre {landing.title}</h2>
                <p className="text-[var(--ag-sys-color-text-muted)] leading-relaxed text-lg mb-12">
                    {landing.description}
                </p>

                <h3 className="text-xl font-extrabold text-[var(--ag-sys-color-text)] mb-8">Preguntas frecuentes</h3>
                <div className="space-y-4">
                    {landing.faqs.map((faq, idx) => (
                        <details
                            key={idx}
                            className="group bg-[var(--ag-sys-color-surface-muted)] rounded-2xl border border-[var(--ag-sys-color-border)] overflow-hidden"
                        >
                            <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-6 text-[var(--ag-sys-color-text)] hover:bg-black/5 transition-colors">
                                <span>{faq.question}</span>
                                <span className="transition-transform duration-300 group-open:-rotate-180">
                                    <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                </span>
                            </summary>
                            <div className="p-6 pt-0 text-[var(--ag-sys-color-text-muted)] leading-relaxed">
                                {faq.answer}
                            </div>
                        </details>
                    ))}
                </div>
            </div>
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
