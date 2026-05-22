"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency, formatRelativeTime } from "@/utils/format";
import { MapPin, Image as ImageIcon, ChevronLeft, ChevronRight, ExternalLink, Heart } from "lucide-react";
import { slugify } from "@/utils/seoUtils";
import { encodeId } from "@/utils/idUtils";
import { FavoriteButton } from "./FavoriteButton";
import supabaseLoader from "@/utils/supabase-image-loader";
import { getImageUrl } from "@/utils/mediaUtils";
import { useTranslation } from "@/context/LocaleContext";
import { LocalizedLink } from "@/components/ui/LocalizedLink";

export interface Listing {
    id: string;
    title: string;
    price: number;
    location: string;
    image_urls: string[];
    created_at: string;
    category: string;
    price_type: string;
    is_featured?: boolean;
    favorites?: Array<{ count: number }>;
}

export function ListingCard({ listing, isFavorited = false, isGhostPreview = false }: { listing: Listing; isFavorited?: boolean; isGhostPreview?: boolean }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showGhostPopup, setShowGhostPopup] = useState(false);
    const { t } = useTranslation();

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

    const resolvedImageUrls = (listing.image_urls || []).map(url => getImageUrl(url));
    const mainImage = resolvedImageUrls[currentImageIndex] || resolvedImageUrls[0];

    const listingSlug = slugify(listing.title);
    const shortId = encodeId(listing.id);

    const handleCardClick = (e: React.MouseEvent) => {
        if (isGhostPreview) {
            e.preventDefault();
            e.stopPropagation();
            setShowGhostPopup(true);
            setTimeout(() => setShowGhostPopup(false), 4000);
        }
    };

    const cardContent = (
        <article className="relative flex flex-col bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-[var(--ag-sys-color-primary)] transition-all duration-300 transform hover:-translate-y-1 h-full">
            
            {/* Ghost Popup Overlay */}
            {showGhostPopup && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl p-5 text-center shadow-2xl transform transition-all scale-100">
                        <div className="w-12 h-12 bg-[var(--ag-sys-color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ExternalLink className="w-6 h-6 text-[var(--ag-sys-color-primary)]" />
                        </div>
                        <h4 className="text-[var(--ag-sys-color-text)] font-extrabold mb-2 text-sm">
                            Anuncio de Demostración
                        </h4>
                        <p className="text-[var(--ag-sys-color-text-muted)] text-xs mb-4">
                            Activa tu perfil de empresa para acceder y personalizar el detalle de tus productos de forma ilimitada.
                        </p>
                        <button className="w-full bg-[var(--ag-sys-color-primary)] text-white text-xs font-bold py-2 rounded-lg hover:opacity-90 transition-opacity">
                            Entendido
                        </button>
                    </div>
                </div>
            )}
            {/* Aspect Ratio 4:3 for Main Image */}
            <div className="relative aspect-[4/3] w-full bg-[var(--ag-sys-color-background)] overflow-hidden border-b border-[var(--ag-sys-color-border)] group/image">
                {mainImage ? (
                    <>
                        <Image
                            loader={supabaseLoader}
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
                        <span className="text-xs font-medium">{t("sin_imagen")}</span>
                    </div>
                )}

                {/* Favorite Badge (Light Style) at bottom right of image */}
                <div className="absolute bottom-2 right-2 z-20 pointer-events-auto" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    <FavoriteButton
                        listingId={listing.id}
                        initialIsFavorited={isFavorited}
                        className="!w-auto !h-auto px-2 py-1 !rounded border border-[var(--ag-sys-color-border)] !bg-white/90 shadow-sm"
                    />
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
                {/* Price & Badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                        {!isGhostPreview && (
                            <span className="font-bold text-lg text-[var(--ag-sys-color-primary)]">
                                {formatCurrency(listing.price)}
                            </span>
                        )}
                        {listing.is_featured && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-wider rounded-md border border-green-200">
                                {t("destacado")}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col items-end">
                        {listing.price_type === 'negotiable' && (
                            <span className="text-[10px] uppercase font-bold text-[var(--ag-sys-color-text-muted)] tracking-wider">{t("negociable")}</span>
                        )}
                        {listing.price_type === 'exchange' && (
                            <span className="text-[10px] uppercase font-bold text-[var(--ag-sys-color-text-muted)] tracking-wider">{t("a_convenir")}</span>
                        )}
                    </div>
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
    );

    return (
        <div className="relative block group h-full">
            {isGhostPreview ? (
                <div onClick={handleCardClick} className="block h-full cursor-pointer">
                    {cardContent}
                </div>
            ) : (
                <LocalizedLink href={`/anuncio/${listingSlug}-${shortId}`} className="block h-full">
                    {cardContent}
                </LocalizedLink>
            )}


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
