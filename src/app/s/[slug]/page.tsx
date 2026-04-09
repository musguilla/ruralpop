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

    let pageTitle = `${landing.title} | Ruralpop`;
    const candidateTitle = `${landing.title} - ${suffix} | Ruralpop`;

    // Maximize title length for Google (usually up to ~65-70 chars)
    if (candidateTitle.length <= 72) {
        pageTitle = candidateTitle;
    }

    // Making the description even more punchy and keyword rich
    const optimizedDescription = `Descubre los mejores anuncios de ${landing.title.toLowerCase()} en nuestra App gratis. El gran mercado agrícola de España para descargar y buscar, comprar y vender ganado, vacas, toros, caballos, maquinaria y más.`;

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

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": landing.faqs.map((faq) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <div className="container mx-auto px-4 pt-0 pb-16 sm:py-8 min-h-screen">
            {/* Inject JSON-LD FAQ Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <Suspense fallback={<div className="h-16 w-full animate-pulse bg-[var(--ag-sys-color-surface)] mb-6" />}>
                <ActiveSearchBar />
            </Suspense>

            <div className="mb-10 text-center sm:text-left mt-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--ag-sys-color-text)] mb-3">{landing.title}</h1>
                <p className="text-[var(--ag-sys-color-text-muted)] text-lg">{landing.subtitle || "Encuentra y compara las mejores ofertas de nuestro mercado agrícola."}</p>
            </div>

            <Suspense fallback={<GridSkeleton />}>
                <ListingsGrid searchParams={combinedParams} />
            </Suspense>

            {/* SEO Content & FAQs (Full Width to match grid) */}
            <div className="w-full mt-24 bg-[var(--ag-sys-color-surface)] p-6 sm:p-10 rounded-3xl border border-[var(--ag-sys-color-border)] shadow-sm">
                <h2 className="text-2xl font-extrabold text-[var(--ag-sys-color-text)] mb-4">Preguntas frecuentes sobre {landing.title.toLowerCase()}</h2>
                <p className="text-[var(--ag-sys-color-text-muted)] leading-relaxed text-lg mb-12">
                    {landing.description}
                </p>

                {/* Custom Content for Tractores */}
                {params.slug === "tractores-segunda-mano" && (
                    <div className="mb-12 text-[var(--ag-sys-color-text)]">
                        <h2 className="text-2xl font-extrabold mb-4">Comprar y vender animales tractores de segunda mano</h2>
                        <p className="text-[var(--ag-sys-color-text-muted)] text-lg mb-4 leading-relaxed">
                            Comprar y vender animales y <strong className="font-bold text-[var(--ag-sys-color-text)]">tractores de segunda mano</strong> nunca había sido tan fácil como hoy en día. Cada vez más profesionales del sector rural, ganaderos y agricultores recurren a plataformas online para encontrar oportunidades reales cerca de su zona, ahorrar costes y dar salida a sus productos o maquinaria de forma rápida.
                        </p>
                        <p className="text-[var(--ag-sys-color-text-muted)] text-lg mb-4 leading-relaxed">
                            Si estás pensando en comprar animales o tractores de segunda mano, es importante contar con un espacio donde la oferta sea variada y actualizada, con vendedores reales y opciones que se adapten a tus necesidades. En Ruralpop puedes comparar desde tractores hasta maquinaria agrícola, puedes comparar, negociar directamente y encontrar precios mucho más competitivos que en el mercado tradicional.
                        </p>
                        <p className="text-[var(--ag-sys-color-text-muted)] text-lg leading-relaxed">
                            Por otro lado, si lo que buscas es vender, este tipo de canales te permiten llegar a miles de personas interesadas en el entorno rural y la búsqueda de maquinaria o tractores. Publicar un anuncio es sencillo y en poco tiempo puedes empezar a recibir contactos de potenciales compradores, sin intermediarios y con total libertad para gestionar tus ventas.
                        </p>
                    </div>
                )}

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
