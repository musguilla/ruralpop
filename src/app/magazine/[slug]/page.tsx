import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Metadata } from "next";

import { MAGAZINE_POSTS } from "@/content/magazine/posts";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
    const post = MAGAZINE_POSTS.find(p => p.id === params.slug);
    if (!post) {
        return {
            title: "Artículo no encontrado | Ruralpop Magazine"
        };
    }
    return {
        title: `${post.title} | Ruralpop Magazine`,
        description: post.excerpt,
    };
}

export default function MagazineArticlePage({ params }: { params: { slug: string } }) {
    const post = MAGAZINE_POSTS.find(p => p.id === params.slug);

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--ag-sys-color-surface)]">
                <h1 className="text-3xl font-bold mb-4 text-[var(--ag-sys-color-text)]">Artículo no encontrado</h1>
                <Link href="/magazine" className="text-[var(--ag-sys-color-primary)] hover:underline">
                    Volver al Magazine
                </Link>
            </div>
        );
    }

    const wordCount = (post.content || post.excerpt).split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    return (
        <article className="min-h-screen bg-[var(--ag-sys-color-surface)] pb-24">
            {/* Header / Intro */}
            <div className="w-full relative h-[50vh] min-h-[400px] overflow-hidden">
                <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                <div className="absolute top-8 left-4 md:left-8 z-10">
                    <Link
                        href="/magazine"
                        className="flex items-center gap-2 text-white bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full backdrop-blur-md transition-colors font-medium text-sm"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Volver a Magazine
                    </Link>
                </div>

                <div className="absolute bottom-10 left-0 w-full px-4">
                    <div className="container mx-auto max-w-4xl flex flex-col gap-4">
                        <span className="text-white/90 text-sm font-semibold tracking-wider uppercase">{post.category}</span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-md">
                            {post.title}
                        </h1>
                        <div className="flex items-center gap-4 text-white/80 text-sm font-medium mt-2">
                            <span>Por Equipo Editorial Ruralpop</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                            <span>{post.date}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                            <span>{readingTime} min lectura</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="container mx-auto px-4 mt-12 max-w-3xl">
                {post.content ? (
                    <div
                        className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:text-[var(--ag-sys-color-text)] prose-a:text-[var(--ag-sys-color-primary)] max-w-none text-[var(--ag-sys-color-text)] leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                ) : (
                    <div className="text-center py-20">
                        <p className="text-[var(--ag-sys-color-text-muted)] text-xl">
                            {post.excerpt}
                        </p>
                        <p className="text-sm mt-4 text-[var(--ag-sys-color-primary)] italic">Contenido en redacción...</p>
                    </div>
                )}

                {/* Tags / Share Actions */}
                <div className="mt-16 pt-8 border-t border-[var(--ag-sys-color-border)] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-[var(--ag-sys-color-surface-sunken)] rounded-md text-sm border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text)]">{post.category}</span>
                    </div>
                </div>
            </div>
        </article>
    );
}

/**
 * Memoria:
 * - Diseño enriquecido (rich-text format) simulando un headless CMS. 
 * - Encabezado 'Hero Article' que usa la portada en fullscreen.
 * - Utilizado Tailwind Typography style via clases comunes.
 */
