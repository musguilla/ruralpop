"use client";

import React, { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/favoritos/actions";

interface FavoriteButtonProps {
    listingId: string;
    initialIsFavorited: boolean;
    className?: string;
}

export function FavoriteButton({ listingId, initialIsFavorited, className = "" }: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
    const [isPending, startTransition] = useTransition();

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Optimistic UI update
        setIsFavorited(!isFavorited);

        startTransition(async () => {
            const result = await toggleFavorite(listingId);
            if (result.error) {
                // Revert if error
                setIsFavorited(isFavorited);

                // If UNAUTHORIZED, redirect to login could be handled here 
                // but let's just keep it simple or show a toast if we had one.
                if (result.code === "UNAUTHORIZED") {
                    window.location.href = "/login?redirectTo=" + encodeURIComponent(window.location.pathname);
                } else {
                    alert(result.error);
                }
            } else if (result.success !== undefined) {
                // Sync with server state just in case
                setIsFavorited(result.isFavorited);
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all hover:scale-110 active:scale-95 ${className}`}
            aria-label={isFavorited ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
            <Heart
                className={`transition-colors duration-300 ${isFavorited ? "fill-rose-500 text-rose-500" : "text-gray-600 hover:text-rose-500"}`}
            />
        </button>
    );
}
