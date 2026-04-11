'use client';

import React, { useRef, useState } from 'react';
import { ProductCard } from '@/components/store/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function StoreSlider({ products }: { products: any[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -current.offsetWidth / 2 : current.offsetWidth / 2;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        if (scrollRef.current) {
            scrollRef.current.style.scrollBehavior = 'auto'; // Disable smooth scroll while dragging
            setStartX(e.pageX - scrollRef.current.offsetLeft);
            setScrollLeft(scrollRef.current.scrollLeft);
        }
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        if (scrollRef.current) {
            scrollRef.current.style.scrollBehavior = 'smooth';
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (scrollRef.current) {
            scrollRef.current.style.scrollBehavior = 'smooth';
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        if (scrollRef.current) {
            const x = e.pageX - scrollRef.current.offsetLeft;
            const walk = (x - startX) * 2;
            scrollRef.current.scrollLeft = scrollLeft - walk;
        }
    };

    return (
        <section className="my-16 pt-12 border-t border-[var(--ag-sys-color-border)] relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--ag-sys-color-text)] flex items-center justify-center sm:justify-start gap-2">
                    <span>🚜</span> Únete al estilo Ruralpop
                </h2>
                <div className="hidden sm:flex gap-2">
                    <button 
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text)] hover:bg-[var(--ag-sys-color-background)] transition-colors focus:outline-none"
                        aria-label="Desplazar a la izquierda"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text)] hover:bg-[var(--ag-sys-color-background)] transition-colors focus:outline-none"
                        aria-label="Desplazar a la derecha"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div 
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 cursor-grab active:cursor-grabbing scroll-smooth"
                style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {products.map((product) => (
                    <div key={product.id} className="w-[260px] sm:w-[280px] lg:w-[calc(25%-1.125rem)] flex-shrink-0 snap-start">
                        <ProductCard 
                            id={product.id}
                            slug={product.slug}
                            title={product.title}
                            price={product.price}
                            imageUrls={product.image_urls}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
