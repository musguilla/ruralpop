"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronRight, ChevronDown } from "lucide-react";
import clsx from "clsx";

export interface Subcategory {
    id: string;
    name: string;
}

export interface CategoryWithSubcategories {
    id: string;
    name: string;
    subcategories: Subcategory[];
}

interface Props {
    categories: CategoryWithSubcategories[];
}

export function CompanyCategoriesSidebar({ categories }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentCategory = searchParams.get("category") || "";
    const currentSubcategory = searchParams.get("subcategory") || "";

    // Mantenemos qué categorías están abiertas en el acordeón
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        if (currentCategory) {
            initial[currentCategory] = true;
        }
        return initial;
    });

    const toggleCategory = (categoryId: string) => {
        setOpenCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    const handleCategoryClick = (categoryId: string) => {
        const params = new URLSearchParams(searchParams);
        if (currentCategory === categoryId && !currentSubcategory) {
            // Deseleccionar
            params.delete("category");
            params.delete("subcategory");
        } else {
            params.set("category", categoryId);
            params.delete("subcategory");
            // Asegurar que se abra
            setOpenCategories(prev => ({ ...prev, [categoryId]: true }));
        }
        params.delete("page");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleSubcategoryClick = (categoryId: string, subcategoryId: string) => {
        const params = new URLSearchParams(searchParams);
        if (currentSubcategory === subcategoryId) {
            // Deseleccionar subcategoría, pero mantener la categoría padre
            params.delete("subcategory");
        } else {
            params.set("category", categoryId);
            params.set("subcategory", subcategoryId);
        }
        params.delete("page");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    if (categories.length === 0) return null;

    const hasFilters = currentCategory || currentSubcategory;

    const handleClearFilters = () => {
        const params = new URLSearchParams(searchParams);
        params.delete("category");
        params.delete("subcategory");
        params.delete("page");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[var(--ag-sys-color-border)] flex items-center justify-between">
                <h3 className="font-bold text-[var(--ag-sys-color-text)]">Categorías</h3>
                {hasFilters && (
                    <button 
                        onClick={handleClearFilters}
                        className="text-xs font-semibold text-[var(--ag-sys-color-primary)] hover:underline"
                    >
                        Limpiar
                    </button>
                )}
            </div>
            
            <div className="flex flex-col">
                {categories.map(category => {
                    const isOpen = openCategories[category.id];
                    const isSelected = currentCategory === category.id;
                    const hasSubcategories = category.subcategories.length > 0;

                    return (
                        <div key={category.id} className="border-b border-[var(--ag-sys-color-border)] last:border-b-0">
                            <div className="flex items-center">
                                <button
                                    onClick={() => handleCategoryClick(category.id)}
                                    className={clsx(
                                        "flex-1 text-left px-4 py-3 text-sm transition-colors hover:bg-gray-50 focus:outline-none",
                                        isSelected && !currentSubcategory ? "font-bold text-[var(--ag-sys-color-primary)]" : "font-medium text-[var(--ag-sys-color-text)]"
                                    )}
                                >
                                    {category.name}
                                </button>
                                {hasSubcategories && (
                                    <button
                                        onClick={() => toggleCategory(category.id)}
                                        className="p-3 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                        aria-label={isOpen ? "Ocultar subcategorías" : "Ver subcategorías"}
                                    >
                                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>

                            {isOpen && hasSubcategories && (
                                <div className="bg-gray-50/50 pb-2 flex flex-col">
                                    {category.subcategories.map(sub => {
                                        const isSubSelected = currentSubcategory === sub.id;
                                        return (
                                            <button
                                                key={sub.id}
                                                onClick={() => handleSubcategoryClick(category.id, sub.id)}
                                                className={clsx(
                                                    "text-left pl-8 pr-4 py-2 text-sm transition-colors hover:text-[var(--ag-sys-color-primary)]",
                                                    isSubSelected 
                                                        ? "font-bold text-[var(--ag-sys-color-primary)]" 
                                                        : "text-[var(--ag-sys-color-text-muted)] font-medium"
                                                )}
                                            >
                                                {sub.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se separa el botón de texto de categoría del chevron para poder hacer clic en el nombre y filtrar de inmediato
 *   y clicar en el chevron solo para expandir. Pero el comportamiento en iOS de tiendas suele ser: tocar nombre abre
 *   y filtra. Aquí se permite que tocar nombre filtre y abra.
 * - Estilo limpio y "mobile friendly" como un acordeón simple.
 */
