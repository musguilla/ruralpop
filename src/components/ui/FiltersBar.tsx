"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CATEGORIES } from "@/constants/categories";

export function FiltersBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const currentCategory = searchParams.get("category");
    const currentSubcategory = searchParams.get("subcategory");

    const categoryData = CATEGORIES.find(c => c.id === currentCategory);

    const handleCategoryClick = (categoryId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (params.get("category") === categoryId) {
            params.delete("category");
        } else {
            params.set("category", categoryId);
        }
        params.delete("subcategory");
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleSubcategoryClick = (sub: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const currentSub = params.get("subcategory");

        // Comparación insensible a mayúsculas para evitar fallos en producción (Vercel)
        if (currentSub?.toLowerCase() === sub.toLowerCase()) {
            params.delete("subcategory");
        } else {
            params.set("subcategory", sub);
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="space-y-4 mb-6">
            {/* Categories Row */}
            <div className="w-full flex pb-2 overflow-x-auto hide-scrollbar gap-2">
                <button
                    onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete("category");
                        params.delete("subcategory");
                        router.push(`${pathname}?${params.toString()}`, { scroll: false });
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

            {/* Subcategories Row (Dynamic) */}
            {categoryData && categoryData.subcategories.length > 0 && (
                <div className="w-full flex pb-2 overflow-x-auto hide-scrollbar gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="flex items-center text-xs font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider pr-2 border-r border-[var(--ag-sys-color-border)] mr-1">
                        Subcategorías
                    </div>
                    {categoryData.subcategories.map((sub) => (
                        <button
                            key={sub}
                            onClick={() => handleSubcategoryClick(sub)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold border transition-all ${currentSubcategory?.toLowerCase() === sub.toLowerCase()
                                ? "border-[var(--ag-sys-color-primary)] bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)]"
                                : "border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text-muted)] hover:border-[var(--ag-sys-color-primary)] hover:text-[var(--ag-sys-color-primary)]"
                                }`}
                        >
                            {sub}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

