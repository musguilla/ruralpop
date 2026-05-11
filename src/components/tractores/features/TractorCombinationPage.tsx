import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getRelatedTractorListingsByFeature } from '@/lib/tractores-data';
import { ArrowLeft, ChevronRight, Settings } from 'lucide-react';

interface Props {
    urlPath: string; // The full path to match in DB
}

export async function TractorCombinationPage({ urlPath }: Props) {
    const supabase = await createClient();

    // 1. Fetch combination page data
    const { data: pageData } = await supabase
        .from('tractor_combination_pages')
        .select(`
            *,
            brand:tractor_brands(id, name, slug)
        `)
        .eq('url_path', urlPath)
        .single();

    if (!pageData) {
        notFound();
    }

    // 2. Fetch models associated with this combination
    const { data: modelsData } = await supabase
        .from('tractor_combination_page_models')
        .select(`
            model:tractor_models(
                id, name, slug, power_hp_min, power_hp_max, engine, transmission,
                brand:tractor_brands(id, name, slug, logo_url)
            )
        `)
        .eq('combination_page_id', pageData.id);

    const models = modelsData?.map((m: any) => m.model).filter(Boolean) || [];

    // Distinct brands for ads matching (for province features)
    const brandsMap = new Map();
    if (pageData.brand) {
        brandsMap.set(pageData.brand.id, pageData.brand);
    } else {
        models.forEach((m: any) => {
            if (m.brand && !Array.isArray(m.brand)) {
                brandsMap.set(m.brand.id, m.brand);
            }
        });
    }
    const relatedBrands = Array.from(brandsMap.values());

    // 3. Fetch related ads (we will pass province if needed to logic later, but for now reuse fuzzy)
    const relatedAds = await getRelatedTractorListingsByFeature(pageData.combination_type, pageData.url_path, models, relatedBrands);

    // 4. Generate JSON-LD Schema
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: pageData.seo_title,
        description: pageData.seo_description,
        url: `https://www.ruralpop.com${pageData.url_path}`
    };

    return (
        <div className="min-h-screen bg-[var(--ag-sys-color-background)] pb-24">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Breadcrumb */}
            <div className="bg-[var(--ag-sys-color-surface)] border-b border-[var(--ag-sys-color-border)] px-4 py-3 sm:px-6 lg:px-8">
                <nav className="flex items-center text-sm font-medium text-[var(--ag-sys-color-text-muted)] max-w-7xl mx-auto overflow-x-auto whitespace-nowrap">
                    <Link href="/" className="hover:text-[var(--ag-sys-color-primary)]">Ruralpop</Link>
                    <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
                    <Link href="/tractores" className="hover:text-[var(--ag-sys-color-primary)]">Tractores</Link>
                    <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
                    {pageData.brand && (
                        <>
                            <Link href={`/tractores/${pageData.brand.slug}`} className="hover:text-[var(--ag-sys-color-primary)]">{pageData.brand.name}</Link>
                            <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
                        </>
                    )}
                    <span className="text-[var(--ag-sys-color-text)] font-semibold truncate max-w-xs">{pageData.h1}</span>
                </nav>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    
                    {/* Main Content */}
                    <div className="flex-1 min-w-0 space-y-12">
                        {/* Hero */}
                        <div className="space-y-4">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--ag-sys-color-text)] tracking-tight text-balance">
                                {pageData.h1}
                            </h1>
                            <p className="text-lg text-[var(--ag-sys-color-text-muted)] leading-relaxed max-w-3xl">
                                {pageData.intro_text}
                            </p>
                            
                            <div className="flex flex-wrap gap-4 pt-4">
                                <div className="px-4 py-2 bg-white rounded-xl border border-[var(--ag-sys-color-border)] shadow-sm flex items-center gap-2">
                                    <span className="font-bold text-lg text-[var(--ag-sys-color-primary)]">{models.length}</span>
                                    <span className="text-sm font-medium text-[var(--ag-sys-color-text-muted)]">Modelos coincidentes</span>
                                </div>
                                {pageData.province_name && (
                                    <div className="px-4 py-2 bg-white rounded-xl border border-[var(--ag-sys-color-border)] shadow-sm flex items-center gap-2">
                                        <span className="font-bold text-lg text-[var(--ag-sys-color-primary)]">📍</span>
                                        <span className="text-sm font-medium text-[var(--ag-sys-color-text-muted)]">{pageData.province_name}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Listado de Modelos */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-[var(--ag-sys-color-text)] flex items-center gap-2">
                                <Settings className="w-6 h-6 text-[var(--ag-sys-color-primary)]" />
                                Catálogo Técnico de Modelos
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {models.map((model: any) => (
                                    <Link 
                                        key={model.id}
                                        href={`/tractores/${model.brand.slug}/${model.slug}`}
                                        className="group bg-white rounded-2xl border border-[var(--ag-sys-color-border)] p-5 hover:border-[var(--ag-sys-color-primary)] hover:shadow-md transition-all flex flex-col"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <p className="text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider mb-1">
                                                    {model.brand.name}
                                                </p>
                                                <h3 className="text-lg font-bold text-[var(--ag-sys-color-text)] group-hover:text-[var(--ag-sys-color-primary)] transition-colors">
                                                    {model.name}
                                                </h3>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-auto pt-4 border-t border-[var(--ag-sys-color-border)] text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Potencia</span>
                                                <span className="font-medium text-gray-700">{model.power_hp_max || model.power_hp_min || '-'} CV</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Transmisión</span>
                                                <span className="font-medium text-gray-700 truncate" title={model.transmission}>{model.transmission || '-'}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* SEO Text */}
                        {pageData.seo_text && (
                            <div className="prose prose-lg prose-blue max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[var(--ag-sys-color-primary)] bg-white p-8 rounded-3xl border border-[var(--ag-sys-color-border)] shadow-sm"
                                dangerouslySetInnerHTML={{ __html: pageData.seo_text }}
                            />
                        )}
                        
                    </div>

                    {/* Sidebar / Ads */}
                    <div className="w-full lg:w-80 flex-shrink-0 space-y-8">
                        <div className="bg-[var(--ag-sys-color-primary)]/5 rounded-3xl p-6 border border-[var(--ag-sys-color-primary)]/20 sticky top-24">
                            <h3 className="text-lg font-bold text-[var(--ag-sys-color-text)] mb-4">
                                Ofertas {pageData.province_name ? `en ${pageData.province_name}` : 'relacionadas'}
                            </h3>
                            {relatedAds && relatedAds.length > 0 ? (
                                <div className="space-y-4">
                                    {relatedAds.map((ad: any) => (
                                        <Link key={ad.id} href={`/anuncio/${ad.slug}`} className="block group">
                                            <div className="bg-white rounded-2xl p-3 border border-[var(--ag-sys-color-border)] shadow-sm group-hover:border-[var(--ag-sys-color-primary)] transition-all">
                                                <h4 className="font-bold text-sm text-[var(--ag-sys-color-text)] line-clamp-2 mb-2 group-hover:text-[var(--ag-sys-color-primary)]">
                                                    {ad.title}
                                                </h4>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="font-bold text-lg">{ad.price ? `${ad.price.toLocaleString('es-ES')}€` : 'Consultar'}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    <Link href="/tractores/segunda-mano" className="block w-full py-3 px-4 bg-white border-2 border-[var(--ag-sys-color-primary)] text-[var(--ag-sys-color-primary)] rounded-xl font-bold text-center text-sm hover:bg-[var(--ag-sys-color-primary)] hover:text-white transition-all">
                                        Ver todos los anuncios
                                    </Link>
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-white rounded-2xl border border-[var(--ag-sys-color-border)]">
                                    <p className="text-sm font-medium text-[var(--ag-sys-color-text-muted)] mb-4 px-4">
                                        No hay tractores de ocasión publicados con estos filtros exactos.
                                    </p>
                                    <Link href="/publicar" className="inline-block py-2 px-6 bg-[var(--ag-sys-color-primary)] text-white rounded-xl font-bold text-sm shadow-sm hover:bg-[var(--ag-sys-color-primary-hover)] transition-all">
                                        Publicar el mío
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
