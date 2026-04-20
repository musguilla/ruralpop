import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Metadata } from "next";
import { AdSenseArticle } from "@/components/ads/AdSenseArticle";
import { AdSenseDisplaySidebar } from "@/components/ads/AdSenseDisplaySidebar";

import { createClient } from "@/utils/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;

    // Server fetch
    const supabase = await createClient();
    const { data: post } = await supabase
        .from("magazine_posts")
        .select("title, excerpt")
        .eq("slug", slug)
        .single();
    if (!post) {
        return {
            title: "Artículo no encontrado | Ruralpop Magazine"
        };
    }
    return {
        title: `${post.title} | Ruralpop Magazine`,
        description: post.excerpt,
        alternates: {
            canonical: `/magazine/${slug}`,
        },
    };
}

export default async function MagazineArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Server fetch
    const supabase = await createClient();
    const { data: postData } = await supabase
        .from("magazine_posts")
        .select("*")
        .eq("slug", slug)
        .single();

    const post = postData ? {
        id: postData.slug,
        title: postData.title,
        excerpt: postData.excerpt,
        category: postData.category,
        imageUrl: postData.image_url,
        date: new Intl.DateTimeFormat('es-ES', {
            day: 'numeric', month: 'short', year: 'numeric'
        }).format(new Date(postData.published_at)),
        content: postData.content
    } : null;

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

    const { data: potentialRelated } = await supabase
        .from("magazine_posts")
        .select("slug, title, image_url, category, published_at")
        .eq("is_published", true)
        .neq("slug", slug)
        .order("published_at", { ascending: false })
        .limit(10);

    const sameCat = (potentialRelated || []).filter((p: any) => p.category === postData.category);
    const diffCat = (potentialRelated || []).filter((p: any) => p.category !== postData.category);
    const relatedPosts = [...sameCat, ...diffCat].slice(0, 3).map((p: any) => ({
        slug: p.slug,
        title: p.title,
        category: p.category,
        imageUrl: p.image_url,
        date: new Intl.DateTimeFormat('es-ES', {
            day: 'numeric', month: 'short', year: 'numeric'
        }).format(new Date(p.published_at))
    }));

    const wordCount = (post.content || post.excerpt).split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Split content to inject AdSense (1: after 2nd paragraph, 2: before antepenultimate paragraph)
    let contentPart1 = post.content || "";
    let contentPart2 = "";
    let contentPart3 = "";

    if (post.content) {
        const rawParts = post.content.split(/<\/p>/i);
        const validParts = rawParts[rawParts.length - 1].trim() === '' ? rawParts.slice(0, -1) : rawParts;

        if (validParts.length >= 6) {
            contentPart1 = validParts.slice(0, 2).join('</p>') + '</p>';
            contentPart2 = validParts.slice(2, validParts.length - 3).join('</p>') + '</p>';
            contentPart3 = validParts.slice(validParts.length - 3).join('</p>') + '</p>';
        } else if (validParts.length > 2) {
            contentPart1 = validParts.slice(0, 2).join('</p>') + '</p>';
            contentPart2 = validParts.slice(2).join('</p>') + '</p>';
        }
    }

    return (
        <article className="w-full min-h-screen bg-[var(--ag-sys-color-surface)] pb-24">
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
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight drop-shadow-md">
                            {post.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 text-white/80 text-sm font-medium mt-3">
                            <span className="text-white font-bold tracking-wider uppercase">{post.category}</span>
                            <span className="w-1 h-1 rounded-full bg-white/50"></span>
                            <span>por Ruralpop</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                            <span>{post.date}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                            <span>{readingTime} min lectura</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout a 3 columnas: L-Sidebar | Content | R-Sidebar */}
            <div className="w-full px-4 md:px-8 xl:px-12 mt-12 max-w-[1920px] mx-auto flex flex-col lg:flex-row gap-8 items-start relative">
                
                {/* Left Sidebar (Solo PC) */}
                <aside className="hidden lg:block w-[200px] xl:w-[300px] flex-shrink-0 sticky top-24">
                    <AdSenseDisplaySidebar />
                </aside>

                {/* Content Body Central */}
                <div className="flex-1 max-w-4xl w-full mx-auto pb-12">
                    {post.content ? (
                        <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:text-[var(--ag-sys-color-text)] prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-a:underline max-w-none text-[var(--ag-sys-color-text)] leading-relaxed">
                            <div dangerouslySetInnerHTML={{ __html: contentPart1 }} />
                            {contentPart2 && <AdSenseArticle />}
                            {contentPart2 && <div dangerouslySetInnerHTML={{ __html: contentPart2 }} />}
                            {contentPart3 && <AdSenseArticle />}
                            {contentPart3 && <div dangerouslySetInnerHTML={{ __html: contentPart3 }} />}
                        </div>
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

                {/* Right Sidebar (Solo PC) */}
                <aside className="hidden lg:block w-[200px] xl:w-[300px] flex-shrink-0 sticky top-24">
                    <AdSenseDisplaySidebar />
                </aside>
            </div>

            {/* Artículos Relacionados */}
            {relatedPosts.length > 0 && (
                <div className="container mx-auto px-4 mt-20 max-w-5xl">
                    <h3 className="text-2xl font-bold mb-8 text-[var(--ag-sys-color-text)] relative inline-block">
                        Artículos que te pueden interesar
                        <div className="absolute -bottom-2 left-0 w-1/3 h-1 bg-[var(--ag-sys-color-primary)] rounded-full"></div>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedPosts.map(related => (
                            <Link href={`/magazine/${related.slug}`} key={related.slug} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[var(--ag-sys-color-border)] shadow-sm hover:shadow-md transition-all">
                                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                                    <Image src={related.imageUrl} alt={related.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-[var(--ag-sys-color-primary)] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                            {related.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col flex-grow">
                                    <h4 className="font-bold text-lg text-[var(--ag-sys-color-text)] line-clamp-2 mb-3 group-hover:text-[var(--ag-sys-color-primary)] transition-colors">
                                        {related.title}
                                    </h4>
                                    <div className="mt-auto pt-4 border-t border-[var(--ag-sys-color-border)] text-sm text-[var(--ag-sys-color-text-muted)] font-medium">
                                        {related.date}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </article>
    );
}

/**
 * Memoria:
 * - Diseño enriquecido (rich-text format) simulando un headless CMS. 
 * - Encabezado 'Hero Article' que usa la portada en fullscreen.
 * - Utilizado Tailwind Typography style via clases comunes.
 */
