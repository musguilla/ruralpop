"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CATEGORIES } from "@/constants/categories";

export function FiltersBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const currentCategory = searchParams.get("category");
    // Considerar que 'q' en searchParams se usará para la búsqueda por texto

    const handleCategoryClick = (categoryId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (params.get("category") === categoryId) {
            // Si ya está activa, la quitamos (toggle)
            params.delete("category");
        } else {
            params.set("category", categoryId);
        }
        // Delete subcategory if category changes
        params.delete("subcategory");

        // Solo actualizamos la URL (push), el servidor Server Component detectará el cambio y re-renderizará
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="w-full flex pb-2 overflow-x-auto hide-scrollbar gap-2 mb-6">
            <button
                onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("category");
                    params.delete("subcategory");
                    router.push(`${pathname}?${params.toString()}`);
                }}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium border transition-all ${!currentCategory
                        ? "border-[var(--ag-sys-color-primary)] bg-[var(--ag-sys-color-primary)] text-white shadow-sm"
                        : "border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text)] hover:border-[var(--ag-sys-color-primary)] hover:text-[var(--ag-sys-color-primary)]"
                    }`}
            >
                Todo
            </button>

            {CATEGORIES.map((category) => (
                <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium border transition-all ${currentCategory === category.id
                            ? "border-[var(--ag-sys-color-primary)] bg-[var(--ag-sys-color-primary)] text-white shadow-sm"
                            : "border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text)] hover:border-[var(--ag-sys-color-primary)] hover:text-[var(--ag-sys-color-primary)]"
                        }`}
                >
                    {category.label}
                </button>
            ))}
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Uso del hook de cliente `useSearchParams` para manipular la query string sin causar recargas completas.
 * - 'hide-scrollbar' necesita ser añadida en globals.css para ocultar la scrollbar visual en webkit.
 */
