"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { CATEGORIES } from "@/constants/categories";

export function AdminFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentQ = searchParams.get("q") || "";
    const currentCategory = searchParams.get("category") || "";
    const currentSubcategory = searchParams.get("subcategory") || "";

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        
        // If changing category, clear subcategory
        if (key === "category") {
            params.delete("subcategory");
        }
        
        // Any filter change resets to page 1
        params.delete("page");
        
        router.push(`/admin/listings?${params.toString()}`);
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        updateFilter("q", formData.get("q") as string);
    };

    const selectedCategoryData = CATEGORIES.find(c => c.id === currentCategory);

    return (
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
                <select
                    value={currentCategory}
                    onChange={(e) => updateFilter("category", e.target.value)}
                    className="w-full sm:w-auto pl-4 pr-10 py-2.5 bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] rounded-full text-sm outline-none focus:border-[var(--ag-sys-color-primary)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]/10 font-bold text-[var(--ag-sys-color-text)] shadow-sm hover:shadow-md cursor-pointer appearance-none transition-all"
                >
                    <option value="">Todas las categorías</option>
                    {CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ag-sys-color-text-muted)] pointer-events-none" />
            </div>

            {selectedCategoryData && selectedCategoryData.subcategories.length > 0 && (
                <div className="relative w-full sm:w-auto">
                    <select
                        value={currentSubcategory}
                        onChange={(e) => updateFilter("subcategory", e.target.value)}
                        className="w-full sm:w-auto pl-4 pr-10 py-2.5 bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] rounded-full text-sm outline-none focus:border-[var(--ag-sys-color-primary)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]/10 font-bold text-[var(--ag-sys-color-text)] shadow-sm hover:shadow-md cursor-pointer appearance-none transition-all"
                    >
                        <option value="">Todas las subcat.</option>
                        {selectedCategoryData.subcategories.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ag-sys-color-text-muted)] pointer-events-none" />
                </div>
            )}

            <form onSubmit={handleSearch} className="relative w-full sm:w-auto flex-shrink-0">
                <input 
                    type="text" 
                    name="q" 
                    defaultValue={currentQ}
                    placeholder="Buscar por título..." 
                    className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] rounded-full text-sm outline-none focus:border-[var(--ag-sys-color-primary)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]/10 transition-all font-medium text-[var(--ag-sys-color-text)] placeholder:font-normal placeholder:opacity-60 shadow-sm hover:shadow-md"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ag-sys-color-text-muted)]" />
            </form>
        </div>
    );
}
