"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
    images: string[];
    title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-[4/3] w-full bg-[var(--ag-sys-color-background)] rounded-3xl flex items-center justify-center border border-[var(--ag-sys-color-border)]">
                <span className="text-[var(--ag-sys-color-text-muted)]">Sin imágenes</span>
            </div>
        );
    }

    const next = () => setActiveIndex((prev) => (prev + 1) % images.length);
    const prev = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
        <div className="space-y-4">
            {/* Main Image Container */}
            <div className="relative aspect-[4/3] w-full bg-[var(--ag-sys-color-background)] rounded-3xl overflow-hidden border border-[var(--ag-sys-color-border)] group">
                <Image
                    src={images[activeIndex]}
                    alt={`${title} - imagen ${activeIndex + 1}`}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                    className="object-contain"
                />

                {images.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-[var(--ag-sys-color-text)] shadow-md transition-all opacity-0 group-hover:opacity-100"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={next}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-[var(--ag-sys-color-text)] shadow-md transition-all opacity-0 group-hover:opacity-100"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-medium">
                            {activeIndex + 1} / {images.length}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`relative flex-shrink-0 w-20 aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeIndex === idx
                                    ? "border-[var(--ag-sys-color-primary)] ring-2 ring-[var(--ag-sys-color-primary)]/20"
                                    : "border-transparent opacity-70 hover:opacity-100"
                                }`}
                        >
                            <Image
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                fill
                                sizes="80px"
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
