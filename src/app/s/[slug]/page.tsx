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

            {/* SEO Content & FAQs */}
            <div className="max-w-4xl mx-auto mt-24 bg-[var(--ag-sys-color-surface)] p-8 sm:p-12 rounded-3xl border border-[var(--ag-sys-color-border)] shadow-sm">
                <h2 className="text-2xl font-extrabold text-[var(--ag-sys-color-text)] mb-4">Sobre {landing.title}</h2>
                <p className="text-[var(--ag-sys-color-text-muted)] leading-relaxed text-lg mb-12">
                    {landing.description}
                </p>

                <h3 className="text-xl font-extrabold text-[var(--ag-sys-color-text)] mb-8">Preguntas frecuentes</h3>
                <div className="space-y-6">
                    {landing.faqs.map((faq, idx) => (
                        <div key={idx} className="bg-[var(--ag-sys-color-surface-muted)] p-6 rounded-2xl border border-[var(--ag-sys-color-border)]">
                            <h4 className="text-lg font-bold text-[var(--ag-sys-color-text)] mb-3">{faq.question}</h4>
                            <p className="text-[var(--ag-sys-color-text-muted)] leading-relaxed">{faq.answer}</p>
                        </div>
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
