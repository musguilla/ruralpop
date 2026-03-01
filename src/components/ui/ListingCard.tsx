"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency, formatRelativeTime } from "@/utils/format";
import { MapPin, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { slugify } from "@/utils/seoUtils";
import { encodeId } from "@/utils/idUtils";
import { FavoriteButton } from "./FavoriteButton";

export interface Listing {
    id: string;
    title: string;
    price: number;
    location: string;
    image_urls: string[];
    created_at: string;
    category: string;
    price_type: string;
}

export function ListingCard({ listing, isFavorited = false }: { listing: Listing; isFavorited?: boolean }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (listing.image_urls && listing.image_urls.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % listing.image_urls.length);
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (listing.image_urls && listing.image_urls.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + listing.image_urls.length) % listing.image_urls.length);
        }
    };

    const mainImage = listing.image_urls?.[currentImageIndex] || listing.image_urls?.[0];

    const listingSlug = slugify(listing.title);
    const shortId = encodeId(listing.id);

    return (
        <div className="relative block group h-full">
            <Link href={`/anuncio/${listingSlug}-${shortId}`} className="block h-full">
                <article className="flex flex-col bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-[var(--ag-sys-color-primary)] transition-all duration-300 transform hover:-translate-y-1 h-full">
                    {/* Aspect Ratio 4:3 for Main Image */}
                    <div className="relative aspect-[4/3] w-full bg-[var(--ag-sys-color-background)] overflow-hidden border-b border-[var(--ag-sys-color-border)] group/image">
                        {mainImage ? (
                            <>
                                <Image
                                    src={mainImage}
                                    alt={listing.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {listing.image_urls && listing.image_urls.length > 1 && (
                                    <>
                                        {/* Prev Button */}
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-all focus:outline-none z-20"
                                            aria-label="Imagen anterior"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>

                                        {/* Next Button */}
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-all focus:outline-none z-20"
                                            aria-label="Siguiente imagen"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>

                                        {/* Dots Indicator */}
                                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
                                            {listing.image_urls.map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${idx === currentImageIndex
                                                        ? 'bg-white scale-110'
                                                        : 'bg-white/50'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-[var(--ag-sys-color-text-muted)] group-hover:text-[var(--ag-sys-color-primary)] transition-colors">
                                <ImageIcon className="w-12 h-12 opacity-50 mb-2" />
                                <span className="text-xs font-medium">Sin imagen</span>
                            </div>
                        )}
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                        {/* Price */}
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-lg text-[var(--ag-sys-color-primary)]">
                                {formatCurrency(listing.price)}
                            </span>
                            {listing.price_type === 'negotiable' && (
                                <span className="text-[10px] uppercase font-bold text-[var(--ag-sys-color-text-muted)] tracking-wider">Negociable</span>
                            )}
                            {listing.price_type === 'exchange' && (
                                <span className="text-[10px] uppercase font-bold text-[var(--ag-sys-color-text-muted)] tracking-wider">A convenir</span>
                            )}
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-[var(--ag-sys-color-text)] line-clamp-2 leading-tight uppercase mb-auto group-hover:text-[var(--ag-sys-color-primary)] transition-colors">
                            {listing.title}
                        </h3>

                        {/* Meta: Location & Time */}
                        <div className="mt-4 pt-4 border-t border-[var(--ag-sys-color-border)] flex items-center justify-between text-xs text-[var(--ag-sys-color-text-muted)]">
                            <div className="flex items-center gap-1.5 truncate max-w-[60%]">
                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{listing.location}</span>
                            </div>
                            <span className="flex-shrink-0 whitespace-nowrap">
                                {formatRelativeTime(listing.created_at)}
                            </span>
                        </div>
                    </div>
                </article>
            </Link>

            {/* Absolute positioning of the heart above the image but inside the relative container */}
            <div className="absolute top-3 right-3 z-10">
                <FavoriteButton
                    listingId={listing.id}
                    initialIsFavorited={isFavorited}
                    className="w-10 h-10 shadow-md"
                />
            </div>
        </div>
    );
}

export function ListingCardSkeleton() {
    return (
        <article className="flex flex-col bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl overflow-hidden shadow-sm h-full animate-pulse">
            <div className="relative aspect-[4/3] w-full bg-[var(--ag-sys-color-border)]/50" />
            <div className="p-4 flex flex-col flex-1 space-y-4">
                <div className="h-6 bg-[var(--ag-sys-color-border)]/50 rounded-md w-1/3" />
                <div className="h-10 bg-[var(--ag-sys-color-border)]/50 rounded-md w-full" />
                <div className="mt-auto pt-4 border-t border-[var(--ag-sys-color-border)] flex justify-between">
                    <div className="h-4 bg-[var(--ag-sys-color-border)]/50 rounded-md w-1/3" />
                    <div className="h-4 bg-[var(--ag-sys-color-border)]/50 rounded-md w-1/4" />
                </div>
            </div>
        </article>
    );
}
