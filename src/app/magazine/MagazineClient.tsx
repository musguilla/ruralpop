"use client";

import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { StripeHeroSlider } from "@/components/magazine/StripeHeroSlider";
export interface BlogPost {
    id: string; // Used as slug
    title: string;
    excerpt: string;
    category: string;
    imageUrl: string;
    date: string;
    content?: string;
}
import Image from "next/image";
import Link from "next/link";

const CATEGORIES = [
    "Todos",
    "Vida Rural",
    "Compraventa",
    "Agricultura y Ganadería",
    "Inversión Rural",
    "Maquinaria",
    "Guías Legales",
    "Historias Rurales",
    "Tendencias",
    "Economía y Lonja"
];

interface MagazineClientProps {
    posts: BlogPost[];
}

export function MagazineClient({ posts }: MagazineClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Todos");

    // Filtrado interactivo en el cliente
    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            const matchesCategory = selectedCategory === "Todos" || post.category === selectedCategory;
            const matchesSearch =
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [posts, searchQuery, selectedCategory]);

    // Si hay filtros activos, no mostramos el hero, solo el grid completo
    const isFiltering = searchQuery.length > 0 || selectedCategory !== "Todos";

    // Si no estamos filtrando, separamos hero y grid como originalmente estaba
    const heroPosts = isFiltering ? [] : filteredPosts.slice(0, 7);
    const gridPosts = isFiltering ? filteredPosts : filteredPosts.slice(7);

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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar guías, noticias, tendencias..."
                            className="block w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--ag-sys-color-surface-sunken)] border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] focus:border-transparent transition-all shadow-sm text-lg"
                        />
                    </div>

                    {/* Categorías (Badges scrollables horizontales sin scrollbar feo) */}
                    <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        {CATEGORIES.map((cat, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedCategory(cat)}
                                className={`whitespace-nowrap px-5 py-2.5 rounded-full border transition-colors font-medium text-sm ${selectedCategory === cat
                                    ? "bg-[var(--ag-sys-color-primary)] text-white border-[var(--ag-sys-color-primary)]"
                                    : "bg-[var(--ag-sys-color-surface-elevated)] border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text)] hover:border-[var(--ag-sys-color-primary)] hover:text-[var(--ag-sys-color-primary)]"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl mt-8">
                {/* Hero interactivo tipo Stripe (se oculta si el usuario está buscando algo en concreto) */}
                {!isFiltering && heroPosts.length > 0 && (
                    <StripeHeroSlider posts={heroPosts} />
                )}

                {/* Separador de Sección */}
                <div className="mt-20 flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-[var(--ag-sys-color-text)]">
                        {isFiltering ? "Resultados de tu búsqueda" : "Últimos Artículos"}
                    </h2>
                </div>

                {/* Mensaje de no encontrado */}
                {filteredPosts.length === 0 && (
                    <div className="text-center py-20 px-4">
                        <div className="bg-[var(--ag-sys-color-surface-sunken)] rounded-3xl p-10 max-w-lg mx-auto border border-[var(--ag-sys-color-border)]">
                            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-[var(--ag-sys-color-text)] mb-2">Sin resultados</h3>
                            <p className="text-[var(--ag-sys-color-text-muted)]">
                                No hemos encontrado ningún artículo que coincida con "{searchQuery}" en la categoría {selectedCategory}.
                            </p>
                            <button
                                onClick={() => { setSearchQuery(""); setSelectedCategory("Todos"); }}
                                className="mt-6 px-6 py-2 bg-[var(--ag-sys-color-primary)] text-white rounded-full font-medium hover:opacity-90 transition-opacity"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    </div>
                )}

                {/* Grid Masonry de Posts */}
                {gridPosts.length > 0 && (
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                        {gridPosts.map((post) => (
                            <Link key={post.id} href={`/magazine/${post.id}`} className="group block focus:outline-none break-inside-avoid">
                                <article className="flex flex-col bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
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
                )}

                {/* Botón Scroll Infinito (solo si no hay filtro, ya que al filtrar mostramos todo de golpe) */}
                {!isFiltering && gridPosts.length >= 13 && (
                    <div className="mt-16 text-center">
                        <button className="px-8 py-3 rounded-full border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text)] font-semibold hover:bg-[var(--ag-sys-color-surface-sunken)] transition-colors">
                            Cargar más artículos...
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}

/**
 * Memoria:
 * - Se esconden los scrollbars de 90s con "[&::-webkit-scrollbar]:hidden" de Tailwind y propiedades estándar directas para IE/Firefox sin dañar la funcionalidad.
 * - Implementado el filtrado de array real con useMemo para asegurar cero latencia.
 * - Si se está buscando algo proactivamente, el HeroSlider desaparece para que la cuadrícula muestre toda la verdad sin esconder posts dentro del Hero.
 */
