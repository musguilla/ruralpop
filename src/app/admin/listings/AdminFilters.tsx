"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { useCategories } from "@/context/CategoriesContext";

export function AdminFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const categories = useCategories();

    const currentQ = searchParams.get("q") || "";
    const currentCategory = searchParams.get("category") || "";
    const currentSubcategory = searchParams.get("subcategory") || "";

    // Build unique select value
    let selectValue = "";
    if (currentCategory && currentSubcategory) {
        selectValue = `sub:${currentCategory}:${currentSubcategory}`;
    } else if (currentCategory) {
        selectValue = `cat:${currentCategory}`;
    }

    const handleCategoryChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("page");

        if (!val) {
            params.delete("category");
            params.delete("subcategory");
        } else if (val.startsWith("cat:")) {
            const catId = val.replace("cat:", "");
            params.set("category", catId);
            params.delete("subcategory");
        } else if (val.startsWith("sub:")) {
            const [, catId, subName] = val.split(":");
            params.set("category", catId);
            params.set("subcategory", subName);
        }

        router.push(`/admin/listings?${params.toString()}`);
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const qVal = formData.get("q") as string;
        const params = new URLSearchParams(searchParams.toString());
        if (qVal) {
            params.set("q", qVal);
        } else {
            params.delete("q");
        }
        params.delete("page");
        router.push(`/admin/listings?${params.toString()}`);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
                <select
                    value={selectValue}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full sm:w-auto pl-4 pr-10 py-2.5 bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] rounded-full text-sm outline-none focus:border-[var(--ag-sys-color-primary)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]/10 font-bold text-[var(--ag-sys-color-text)] shadow-sm hover:shadow-md cursor-pointer appearance-none transition-all"
                >
                    <option value="">Todas las categorías</option>
                    {categories.map((c) => {
                        if (!c.subcategories || c.subcategories.length === 0) {
                            return (
                                <option key={c.id} value={`cat:${c.id}`}>
                                    {c.label}
                                </option>
                            );
                        }
                        return (
                            <optgroup key={c.id} label={c.label}>
                                <option value={`cat:${c.id}`}>Toda {c.label}</option>
                                {c.subcategories.map((sub) => (
                                    <option key={sub} value={`sub:${c.id}:${sub}`}>
                                        &nbsp;&nbsp;↳ {sub}
                                    </option>
                                ))}
                            </optgroup>
                        );
                    })}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ag-sys-color-text-muted)] pointer-events-none" />
            </div>

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
