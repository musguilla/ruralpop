"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams, usePathname, useParams } from "next/navigation";
import { Search, X, SlidersHorizontal, MapPin } from "lucide-react";
import { CATEGORIES } from "@/constants/categories";
import { LOCATIONS } from "@/constants/locations";
import { parseSeoUrl, buildSeoUrl } from "@/utils/seoUtils";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

export function ActiveSearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const urlParams = useParams();

    const slug = urlParams?.slug as string | undefined;
    const parsedSlug = slug ? parseSeoUrl(slug) : null;

    const query = parsedSlug ? parsedSlug.q : searchParams.get("q");
    const category = parsedSlug ? parsedSlug.category : searchParams.get("category");
    const subcategory = parsedSlug ? parsedSlug.subcategory : searchParams.get("subcategory");
    const location = parsedSlug ? parsedSlug.province_id : searchParams.get("province_id");

    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    // Local state for modal filters
    const [priceMin, setPriceMin] = useState(searchParams.get("price_min") || "");
    const [priceMax, setPriceMax] = useState(searchParams.get("price_max") || "");
    const [sellerType, setSellerType] = useState(searchParams.get("seller_type") || "all");

    // Unified category/subcategory state
    const [modalCategoryValue, setModalCategoryValue] = useState(() => {
        if (subcategory) return `sub_${subcategory}`;
        if (category) return `cat_${category}`;
        return "";
    });

    const [modalLocation, setModalLocation] = useState(location || "");

    // What is displayed in the active search pill
    let pillText = "Busqueda activa";
    if (query) pillText = query;
    else if (subcategory) pillText = subcategory;
    else if (category) {
        const cat = CATEGORIES.find(c => c.id === category);
        pillText = cat ? cat.label : category;
    } else if (location) {
        pillText = `Provincia: ${location}`;
    }

    const clearSearch = () => {
        router.push("/");
    };

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (priceMin) params.set("price_min", priceMin);
        else params.delete("price_min");

        if (priceMax) params.set("price_max", priceMax);
        else params.delete("price_max");

        if (sellerType !== "all") params.set("seller_type", sellerType);
        else params.delete("seller_type");

        setIsFiltersOpen(false);

        let newCat = undefined;
        let newSub = undefined;

        if (modalCategoryValue.startsWith("cat_")) {
            newCat = modalCategoryValue.replace("cat_", "");
        } else if (modalCategoryValue.startsWith("sub_")) {
            newSub = modalCategoryValue.replace("sub_", "");
            // Find parent category to generate SEO URL properly
            newCat = CATEGORIES.find(c => c.subcategories.includes(newSub!))?.id;
        }

        const baseUrl = buildSeoUrl({
            q: query ?? undefined,
            category: newCat || undefined,
            subcategory: newSub || undefined,
            province_id: modalLocation || undefined
        });

        params.delete("q");
        params.delete("category");
        params.delete("subcategory");
        params.delete("province_id");

        const queryStr = params.toString();
        router.push(`${baseUrl}${queryStr ? '?' + queryStr : ''}`);
    };

    const clearFilters = () => {
        setPriceMin("");
        setPriceMax("");
        setSellerType("all");
        setModalCategoryValue("");
        setModalLocation("");

        const baseUrl = buildSeoUrl({
            q: query || undefined,
            category: undefined,
            subcategory: undefined,
            province_id: undefined
        });

        router.push(baseUrl);
        setIsFiltersOpen(false);
    };

    return (
        <div className="w-full flex justify-center py-6 mb-6">
            <div className="flex gap-3 w-full max-w-4xl px-4">

                {/* Active Pill */}
                <div
                    className="flex-1 flex items-center justify-between bg-white border border-[var(--ag-sys-color-border)] rounded-full shadow-sm hover:shadow-md px-6 py-3 transition-all cursor-pointer"
                    onClick={clearSearch}
                >
                    <div className="flex items-center gap-3 text-[var(--ag-sys-color-text)]">
                        <Search className="w-5 h-5 text-gray-400" />
                        <span className="text-base truncate">{pillText}</span>
                    </div>
                    <button
                        className="p-1 rounded-full border-2 border-black transition-colors hover:bg-gray-100 flex items-center justify-center shrink-0"
                        aria-label="Limpiar búsqueda"
                    >
                        <X className="w-4 h-4 text-black" strokeWidth={3} />
                    </button>
                </div>

                {/* Filters Button */}
                <button
                    onClick={() => setIsFiltersOpen(true)}
                    className="flex items-center gap-2 bg-white border border-[var(--ag-sys-color-border)] shadow-sm hover:shadow-md rounded-full px-6 py-3 text-[var(--ag-sys-color-text)] font-semibold text-base hover:border-[var(--ag-sys-color-primary)] transition-all shrink-0"
                >
                    <SlidersHorizontal className="w-5 h-5" />
                    <span className="hidden sm:inline">Filtros</span>
                </button>
            </div>

            {/* Backdrop & Modal */}
            {isFiltersOpen && (
                <div className="fixed inset-0 z-[100] flex justify-center bg-black/50 overflow-y-auto w-full transition-opacity">
                    <div className="bg-white w-full max-w-lg min-h-screen sm:min-h-0 sm:h-fit sm:my-auto sm:rounded-2xl flex flex-col relative animate-in slide-in-from-bottom-5">
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-[var(--ag-sys-color-border)]">
                            <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
                            <button onClick={() => setIsFiltersOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">

                            {/* Categories */}
                            <div className="space-y-2 flex flex-col">
                                <label className="flex items-center justify-between cursor-pointer w-full text-left py-2 hover:opacity-80">
                                    <span className="font-semibold text-gray-900 text-sm">Categoría</span>
                                </label>
                                <SearchableSelect
                                    name="modalCategory"
                                    value={modalCategoryValue}
                                    onChange={(val) => setModalCategoryValue(val as string)}
                                    options={[
                                        { id: "", name: "Todas las categorías" },
                                        ...CATEGORIES.flatMap(c => [
                                            { id: `cat_${c.id}`, name: c.label },
                                            ...c.subcategories.map(sub => ({ id: `sub_${sub}`, name: `↳ ${sub}` }))
                                        ])
                                    ]}
                                    placeholder="Todas las categorías"
                                    searchPlaceholder="Buscar categoría o subcategoría..."
                                />
                            </div>

                            {/* Location */}
                            <div className="space-y-2 flex flex-col">
                                <label className="flex items-center gap-1.5 cursor-pointer w-full text-left py-2 hover:opacity-80">
                                    <MapPin className="w-4 h-4 text-[var(--ag-sys-color-primary)]" />
                                    <span className="font-semibold text-gray-900 text-sm">Localización</span>
                                </label>
                                <SearchableSelect
                                    name="modalLocation"
                                    value={modalLocation}
                                    onChange={(val) => setModalLocation(val as string)}
                                    options={[
                                        { id: "", name: "Toda España" },
                                        ...LOCATIONS.map(loc => ({ id: loc.id, name: loc.type === 'municipality' ? `↳ ${loc.name} (${loc.province})` : loc.name }))
                                    ]}
                                    placeholder="Toda España"
                                    searchPlaceholder="Buscar provincia o localidad..."
                                />
                            </div>

                            {/* Price */}
                            <div className="space-y-3">
                                <span className="font-semibold text-gray-900 text-sm block">Precio</span>
                                <div className="flex gap-4">
                                    <div className="flex-1 relative">
                                        <input
                                            type="number"
                                            placeholder="Desde"
                                            className="w-full border border-[var(--ag-sys-color-border)] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none bg-gray-50"
                                            value={priceMin}
                                            onChange={(e) => setPriceMin(e.target.value)}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                                    </div>
                                    <div className="flex-1 relative">
                                        <input
                                            type="number"
                                            placeholder="Hasta"
                                            className="w-full border border-[var(--ag-sys-color-border)] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none bg-gray-50"
                                            value={priceMax}
                                            onChange={(e) => setPriceMax(e.target.value)}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                                    </div>
                                </div>
                            </div>

                            {/* Seller Type */}
                            <div className="space-y-3">
                                <span className="font-semibold text-gray-900 text-sm block">Tipo de vendedor</span>
                                <div className="flex bg-gray-50 border border-[var(--ag-sys-color-border)] rounded-lg p-1 overflow-hidden">
                                    {(['all', 'particular', 'profesional'] as const).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setSellerType(type)}
                                            className={`flex-1 text-center py-2 text-sm font-medium rounded-md transition-colors ${sellerType === type ? 'bg-white shadow text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            {type === 'all' ? 'Todos' : type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-[var(--ag-sys-color-border)] flex gap-4">
                            <button
                                onClick={clearFilters}
                                className="flex-1 py-3 text-emerald-700 font-semibold text-sm hover:underline"
                            >
                                Limpiar filtros
                            </button>
                            <button
                                onClick={applyFilters}
                                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-lg font-semibold text-sm transition-colors"
                            >
                                Ver resultados
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
