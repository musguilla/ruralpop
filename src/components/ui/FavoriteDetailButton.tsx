"use client";

import React, { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/favoritos/actions";
import { useTranslation } from "@/context/LocaleContext";

interface FavoriteDetailButtonProps {
    listingId: string;
    initialIsFavorited: boolean;
}

export function FavoriteDetailButton({ listingId, initialIsFavorited }: FavoriteDetailButtonProps) {
    const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
    const [isPending, startTransition] = useTransition();
    const { t } = useTranslation();

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsFavorited(!isFavorited);

        startTransition(async () => {
            const result = await toggleFavorite(listingId);
            if (result.error) {
                setIsFavorited(isFavorited);
                if (result.code === "UNAUTHORIZED") {
                    window.location.href = "/login?redirectTo=" + encodeURIComponent(window.location.pathname);
                } else {
                    alert(result.error);
                }
            } else if (result.success !== undefined) {
                setIsFavorited(result.isFavorited);
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`w-full flex items-center justify-center gap-2 py-4 px-6 border font-bold rounded-2xl transition-all active:scale-95 ${isFavorited
                    ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                    : "bg-white border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text)] hover:bg-gray-50"
                }`}
        >
            <Heart
                className={`w-5 h-5 transition-colors duration-300 ${isFavorited ? "fill-rose-500 text-rose-500" : "text-gray-400"}`}
            />
            {isFavorited ? t("guardado_favoritos") : t("guardar_favorito_btn")}
        </button>
    );
}
