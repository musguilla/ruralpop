"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageGalleryProps {
    images: string[];
    title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
    const [[page, direction], setPage] = useState([0, 0]);

    // Usamos módulo seguro para arrays circulares (índice real)
    const activeIndex = ((page % images.length) + images.length) % images.length;

    if (!images || images.length === 0) {
        return (
            <div className="aspect-[4/3] w-full bg-[var(--ag-sys-color-background)] rounded-3xl flex items-center justify-center border border-[var(--ag-sys-color-border)]">
                <span className="text-[var(--ag-sys-color-text-muted)]">Sin imágenes</span>
            </div>
        );
    }

    const paginate = (newDirection: number) => {
        setPage([page + newDirection, newDirection]);
    };

    const next = () => paginate(1);
    const prev = () => paginate(-1);

    const variants = {
        enter: (direction: number) => {
            return {
                x: direction > 0 ? "100%" : "-100%",
                opacity: 0,
                scale: 0.95,
            };
        },
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction: number) => {
            return {
                zIndex: 0,
                x: direction < 0 ? "100%" : "-100%",
                opacity: 0,
                scale: 0.95,
            };
        }
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    return (
        <div className="space-y-4 overflow-hidden">
            {/* Contenedor Físico (Framer Motion) */}
            <div className="relative aspect-[4/3] w-full bg-[var(--ag-sys-color-background)] rounded-3xl overflow-hidden border border-[var(--ag-sys-color-border)] group select-none flex items-center justify-center">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={page}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                            scale: { duration: 0.2 }
                        }}
                        drag={images.length > 1 ? "x" : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x);

                            if (swipe < -swipeConfidenceThreshold) {
                                paginate(1);
                            } else if (swipe > swipeConfidenceThreshold) {
                                paginate(-1);
                            }
                        }}
                        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
                    >
                        <Image
                            src={images[activeIndex]}
                            alt={`${title} - imagen ${activeIndex + 1}`}
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                            className="object-contain pointer-events-none"
                        />
                    </motion.div>
                </AnimatePresence>

                {images.length > 1 && (
                    <>
                        {/* Botones Flotantes (Escritorio) */}
                        <button
                            onClick={(e) => { e.preventDefault(); prev(); }}
                            className="absolute z-10 left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-[var(--ag-sys-color-text)] shadow-md transition-all opacity-0 md:group-hover:opacity-100"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); next(); }}
                            className="absolute z-10 right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-[var(--ag-sys-color-text)] shadow-md transition-all opacity-0 md:group-hover:opacity-100"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        <div className="absolute z-10 bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-medium backdrop-blur-sm pointer-events-none">
                            {activeIndex + 1} / {images.length}
                        </div>
                    </>
                )}
            </div>

            {/* Selector de Miniaturas Inferior */}
            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar px-1">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                const newDirection = idx > activeIndex ? 1 : -1;
                                const pageDiff = idx - activeIndex;
                                setPage([page + pageDiff, newDirection]);
                            }}
                            className={`relative flex-shrink-0 w-20 aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeIndex === idx
                                ? "border-[var(--ag-sys-color-primary)] ring-2 ring-[var(--ag-sys-color-primary)]/20 shadow-sm"
                                : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                                }`}
                        >
                            <Image
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                fill
                                sizes="80px"
                                className="object-cover pointer-events-none"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Animaciones físicas implementadas con framer-motion.
 * - Soporte para drag nativo logrando efecto rebote y anclaje elástico.
 */
