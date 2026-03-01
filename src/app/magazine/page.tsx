import React from "react";
import { Metadata } from "next";
import { Search } from "lucide-react";
import { StripeHeroSlider } from "@/components/magazine/StripeHeroSlider";
import { MAGAZINE_POSTS } from "@/content/magazine/posts";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Ruralpop Magazine | La conexión rural",
    description: "Noticias, guías legales, historias y toda la actualidad del mundo rural, agricultura y ganadería.",
};

const CATEGORIES = [
    "Vida Rural",
    "Compraventa",
    "Agricultura y Ganadería",
    "Inversión Rural",
    "Maquinaria",
    "Guías Legales",
    "Historias Rurales",
    "Tendencias"
];

const HERO_POSTS = MAGAZINE_POSTS.slice(0, 7);
const GRID_POSTS = MAGAZINE_POSTS.slice(7);

export default function MagazinePage() {
    return (
        <main className="min-h-screen bg-[var(--ag-sys-color-surface)] pb-24">
            {/* Header / Intro Section */}
            <div className="w-full bg-[var(--ag-sys-color-surface)] pt-16 pb-8 border-b border-[var(--ag-sys-color-border)]">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight mb-8">
                        Ruralpop <span className="text-[var(--ag-sys-color-primary)]">Magazine</span>
                    </h1>

                    {/* Buscador Estilizado */}
                    <div className="relative max-w-2xl mb-12">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar guías, noticias, tendencias..."
                            className="block w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--ag-sys-color-surface-sunken)] border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] focus:border-transparent transition-all shadow-sm text-lg"
                        />
                    </div>

                    {/* Categorías (Badges scrollables) */}
                    <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar webkit-scrollbar-hide">
                        {CATEGORIES.map((cat, idx) => (
                            <button
                                key={idx}
                                className="whitespace-nowrap px-5 py-2.5 rounded-full border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-surface-elevated)] text-[var(--ag-sys-color-text)] text-sm font-medium hover:bg-[var(--ag-sys-color-primary)] hover:text-white transition-colors hover:border-[var(--ag-sys-color-primary)]"
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl mt-8">
                {/* Hero interactivo tipo Stripe */}
                <StripeHeroSlider posts={HERO_POSTS} />

                {/* Separador de Sección */}
                <div className="mt-20 flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-[var(--ag-sys-color-text)]">
                        Últimos Artículos
                    </h2>
                </div>

                {/* Grid Masonry de Posts (20 en 20 emulado) */}
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                    {GRID_POSTS.map((post) => (
                        <Link key={post.id} href={`/magazine/${post.id}`} className="group block focus:outline-none break-inside-avoid">
                            <article className="flex flex-col bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                {/* Auto-altos aleatorios usando aspect-video como base pero permitiendo flexibilidades */}
                                <div className="relative w-full aspect-[4/3] sm:aspect-auto sm:min-h-[200px] bg-gray-100 overflow-hidden">
                                    <Image
                                        src={post.imageUrl}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur text-black text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col gap-3">
                                    <span className="text-xs text-[var(--ag-sys-color-text-muted)] font-medium">
                                        {post.date}
                                    </span>
                                    <h3 className="text-xl font-bold leading-tight text-[var(--ag-sys-color-text)] group-hover:text-[var(--ag-sys-color-primary)] transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-[var(--ag-sys-color-text-muted)] line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>

                {/* Botón Scroll Infinito (Load More Emulado) */}
                <div className="mt-16 text-center">
                    <button className="px-8 py-3 rounded-full border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text)] font-semibold hover:bg-[var(--ag-sys-color-surface-sunken)] transition-colors">
                        Cargar más artículos...
                    </button>
                </div>
            </div>
        </main>
    );
}

/**
 * Memoria:
 * - Implementación de grid CSS masonry-lite mediante 'columns-1 sm:columns-2 lg:columns-3' y 'break-inside-avoid' para el aspecto waterfall dinámico sin librerías pesadas.
 * - Utilización de diseño tipográfico grande y márgenes espaciosos que respiran premium.
 * - Badges estilizados como botones quick-filters horizontales.
 */
