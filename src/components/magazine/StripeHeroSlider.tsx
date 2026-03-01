"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    imageUrl: string;
    date: string;
}

export function StripeHeroSlider({ posts }: { posts: BlogPost[] }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const router = useRouter();

    if (!posts || posts.length === 0) return null;

    const activePost = posts[activeIndex];

    return (
        <div className="w-full flex flex-col gap-6 my-12">
            {/* Gallery Track */}
            <div className="flex h-[350px] md:h-[500px] w-full gap-2 md:gap-4 overflow-hidden rounded-2xl">
                {posts.map((post, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                        <div
                            key={post.id}
                            onClick={() => isActive ? router.push(`/magazine/${post.id}`) : setActiveIndex(idx)}
                            className={`relative group overflow-hidden rounded-2xl cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isActive ? "flex-[10] shadow-xl" : "flex-[1] shadow-sm hover:flex-[1.5]"
                                }`}
                        >
                            {/* Backdrop / Image */}
                            <Image
                                src={post.imageUrl}
                                alt={post.title}
                                fill
                                className={`object-cover transition-transform duration-1000 ${isActive ? "scale-100" : "scale-125 opacity-70 group-hover:opacity-100"
                                    }`}
                                sizes="(max-width: 768px) 100vw, 80vw"
                            />

                            {/* Gradient Overlay for the active card to make text readable */}
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                            )}

                            {/* Inner Title (Only for active, or partially shown) */}
                            {isActive && (
                                <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 flex flex-col gap-2 opacity-0 animate-[fadeIn_0.5s_ease-out_0.3s_forwards]">
                                    <span className="text-white/80 font-semibold tracking-wider text-xs uppercase bg-black/40 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                                        {post.category}
                                    </span>
                                    <h2 className="text-2xl md:text-5xl font-bold text-white leading-tight drop-shadow-md max-w-3xl">
                                        {post.title}
                                    </h2>
                                </div>
                            )}

                            {/* Optional: Small vertical text for inactive cards if desired, but Stripe just shows the image peek */}
                        </div>
                    );
                })}
            </div>

            {/* Bottom Content Area (Title & Excerpt synchronized) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                <div className="flex flex-col max-w-2xl gap-2">
                    <p className="text-lg md:text-xl text-[var(--ag-sys-color-text-muted)] leading-relaxed">
                        <strong className="text-[var(--ag-sys-color-text)] font-semibold mr-2">
                            {activePost.date}.
                        </strong>
                        {activePost.excerpt}
                    </p>
                </div>

                <Link
                    href={`/magazine/${activePost.id}`}
                    className="shrink-0 flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] hover:border-[var(--ag-sys-color-primary)] transition-all bg-[var(--ag-sys-color-surface)] shadow-sm font-medium"
                >
                    Leer artículo
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Custom Animation Keyframes (can be handled by Tailwind standard but defined here for safety) */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

/**
 * Memoria:
 * - Componente slider a lo "Stripe" que mapea un array de posts.
 * - flex-[10] vs flex-[1] crea la expansión fluida de 70%-10% nativamente gracias al flexbox.
 * - Sin librerías extra, puro state y CSS transitions para máxima optimización (0 layout shifts raros).
 */
